use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::time::Instant;
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter};

// Standard lazy static implementation using std::sync::OnceLock
static BOT_STATE: std::sync::OnceLock<Arc<Mutex<BotProcessManager>>> = std::sync::OnceLock::new();

pub struct BotProcessManager {
    child: Option<Child>,
    stdin: Option<ChildStdin>,
    active_bot_id: Option<String>,
    started_at: Option<Instant>,
    status: String,
}

impl BotProcessManager {
    pub fn new() -> Self {
        Self {
            child: None,
            stdin: None,
            active_bot_id: None,
            started_at: None,
            status: "stopped".to_string(),
        }
    }
}

fn get_manager() -> Arc<Mutex<BotProcessManager>> {
    BOT_STATE
        .get_or_init(|| Arc::new(Mutex::new(BotProcessManager::new())))
        .clone()
}

fn normalize_path(path: PathBuf) -> PathBuf {
    let s = path.to_string_lossy();
    if let Some(stripped) = s.strip_prefix(r"\\?\") {
        PathBuf::from(stripped)
    } else {
        path
    }
}

#[allow(dead_code)]
struct HardwareInfo {
    gpu: String,
    cpu: String,
    user: String,
}

fn run_ps_hw() -> HardwareInfo {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let script = r#"& {
            $u = [System.Environment]::UserName
            $gpu = (Get-CimInstance Win32_VideoController -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name -First 1)
            $cpu = (Get-CimInstance Win32_Processor -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name -First 1)
            [PSCustomObject]@{ user = "$u"; gpu = "$gpu"; cpu = "$cpu" } | ConvertTo-Json -Compress
        }"#;

        if let Ok(output) = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", script])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
        {
            let s = String::from_utf8_lossy(&output.stdout);
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(&s) {
                let gpu = val["gpu"].as_str().filter(|g| !g.is_empty()).unwrap_or("GPU Integrada / Dedicada").trim().to_string();
                let cpu = val["cpu"].as_str().filter(|c| !c.is_empty()).unwrap_or("Processador").trim().to_string();
                let user = val["user"].as_str().filter(|u| !u.is_empty()).unwrap_or("Usuário").trim().to_string();
                return HardwareInfo { gpu, cpu, user };
            }
        }
    }

    HardwareInfo {
        gpu: "GPU do Sistema".to_string(),
        cpu: "Processador".to_string(),
        user: "Usuário".to_string(),
    }
}

fn resolve_project_root() -> PathBuf {
    let sub_variations = ["", "_up_", "resources", "resources/_up_"];

    // 1. Check relative to current working directory and parents
    let base_dirs = [
        PathBuf::from("."),
        PathBuf::from(".."),
        PathBuf::from("../.."),
        PathBuf::from("../../.."),
    ];

    for base in &base_dirs {
        for sub in &sub_variations {
            let candidate = if sub.is_empty() {
                base.clone()
            } else {
                base.join(sub)
            };
            let check = candidate.join("integrations/robloxbot/adapter.py");
            if check.exists() {
                if let Ok(canon) = std::fs::canonicalize(&candidate) {
                    return normalize_path(canon);
                }
                return candidate;
            }
        }
    }

    // 2. Check executable directory and up to 6 parent levels (Tauri NSIS installer layout)
    if let Ok(exe_path) = std::env::current_exe() {
        let mut dir = exe_path;
        for _ in 0..7 {
            if !dir.pop() {
                break;
            }
            for sub in &sub_variations {
                let candidate = if sub.is_empty() {
                    dir.clone()
                } else {
                    dir.join(sub)
                };
                let check = candidate.join("integrations/robloxbot/adapter.py");
                if check.exists() {
                    if let Ok(canon) = std::fs::canonicalize(&candidate) {
                        return normalize_path(canon);
                    }
                    return candidate;
                }
            }
        }
    }

    // 3. Check AppData Local Programs fallback
    if let Ok(local_app) = std::env::var("LOCALAPPDATA") {
        let p = PathBuf::from(local_app).join("Programs/Pedi para meu marido");
        for sub in &sub_variations {
            let candidate = if sub.is_empty() { p.clone() } else { p.join(sub) };
            if candidate.join("integrations/robloxbot/adapter.py").exists() {
                if let Ok(canon) = std::fs::canonicalize(&candidate) {
                    return normalize_path(canon);
                }
                return candidate;
            }
        }
    }

    PathBuf::from(".")
}

/// Localiza qualquer script garantindo resolução em dev ou no bundle NSIS
fn resolve_script_file(rel_path: &str) -> PathBuf {
    let root = resolve_project_root();
    let direct = root.join(rel_path);
    if direct.exists() {
        return direct;
    }

    // Fallback para variações
    let variations = [
        format!("_up_/{}", rel_path),
        format!("resources/{}", rel_path),
        format!("resources/_up_/{}", rel_path),
    ];

    for v in &variations {
        let check = root.join(v);
        if check.exists() {
            return check;
        }
    }

    // Fallback relativo ao executável
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(parent) = exe_path.parent() {
            for v in &variations {
                let check = parent.join(v);
                if check.exists() {
                    return check;
                }
            }
            let direct_parent = parent.join(rel_path);
            if direct_parent.exists() {
                return direct_parent;
            }
        }
    }

    direct
}

fn resolve_python_path() -> PathBuf {
    let root = resolve_project_root();
    
    // 1. Check isolated virtualenv in project root or its _up_
    let venv_candidates = [
        root.join("runtime/python/bots-env/Scripts/python.exe"),
        root.join("_up_/runtime/python/bots-env/Scripts/python.exe"),
    ];
    for venv_path in &venv_candidates {
        if venv_path.exists() {
            if let Ok(canon) = std::fs::canonicalize(venv_path) {
                return normalize_path(canon);
            }
            return venv_path.clone();
        }
    }

    // 2. Check user-wide virtualenv in %APPDATA%\PediParaMeuMarido\runtime\bots-env
    if let Ok(app_data) = std::env::var("APPDATA") {
        let global_venv = PathBuf::from(app_data).join("PediParaMeuMarido/runtime/bots-env/Scripts/python.exe");
        if global_venv.exists() {
            if let Ok(canon) = std::fs::canonicalize(&global_venv) {
                return normalize_path(canon);
            }
            return global_venv;
        }
    }

    // 3. Check standard Python install in %LOCALAPPDATA%\Programs\Python
    if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
        for ver in &["Python311", "Python310", "Python312"] {
            let py_path = PathBuf::from(&local_app_data).join(format!("Programs/Python/{}/python.exe", ver));
            if py_path.exists() {
                return py_path;
            }
        }
    }

    // 4. Fallback to system python
    PathBuf::from("python")
}

#[tauri::command]
pub fn bot_start(
    app: AppHandle,
    bot_id: String,
    config: Value,
) -> Result<Value, String> {
    let mgr_lock = get_manager();
    let mut mgr = mgr_lock.lock().map_err(|e| e.to_string())?;

    // Se ainda houver processo zumbi/travado do start anterior, mata a árvore inteira
    if let Some(ref mut c) = mgr.child {
        match c.try_wait() {
            Ok(None) => {
                let pid = c.id();
                let _ = force_kill_process_tree(pid);
                let _ = c.kill();
                let _ = c.wait();
            }
            Ok(Some(_)) => {}
            Err(_) => {
                let _ = c.kill();
                let _ = c.wait();
            }
        }
        mgr.child = None;
        mgr.stdin = None;
        mgr.active_bot_id = None;
    }

    let root = resolve_project_root();
    let python_exe = resolve_python_path();
    let adapter_script = resolve_script_file("integrations/robloxbot/adapter.py");

    if !adapter_script.exists() {
        return Err(format!(
            "Script adaptador não encontrado: {:?}. Clique no banner '⚡ Instalar Automaticamente (1 Clique)' para preparar o ambiente dos bots!",
            adapter_script
        ));
    }

    let python_path_env = format!(
        "{};{};{}",
        root.to_string_lossy(),
        root.join("sdk").to_string_lossy(),
        root.join("integrations").to_string_lossy()
    );

    // Spawn Python process with structured arguments and piped stdio (no shell injection)
    let mut child = Command::new(&python_exe)
        .current_dir(&root)
        .env("PYTHONPATH", python_path_env)
        .arg("-u") // unbuffered stdio
        .arg(&adapter_script)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Falha ao iniciar Python ({:?}): {}. Prepare o ambiente clicando em Instalar Automaticamente.", python_exe, e))?;

    let stdout = child.stdout.take().ok_or("Falha ao abrir stdout do bot")?;
    let stderr = child.stderr.take().ok_or("Falha ao abrir stderr do bot")?;
    let mut stdin = child.stdin.take().ok_or("Falha ao abrir stdin do bot")?;

    // Pequena folga para o listener de stdin do Python subir (evita perder o START)
    std::thread::sleep(std::time::Duration::from_millis(200));

    // Send initial START command with config
    let start_cmd = json!({
        "type": "START",
        "bot_id": bot_id,
        "config": config
    });
    let cmd_str = format!("{}\n", start_cmd.to_string());
    let _ = stdin.write_all(cmd_str.as_bytes());
    let _ = stdin.flush();

    let pid = child.id();

    mgr.child = Some(child);
    mgr.stdin = Some(stdin);
    mgr.active_bot_id = Some(bot_id.clone());
    mgr.started_at = Some(Instant::now());
    mgr.status = "initializing".to_string();

    // Spawn reader thread for stdout JSON lines
    let app_stdout = app.clone();
    let bot_id_stdout = bot_id.clone();
    std::thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line_res in reader.lines() {
            if let Ok(line) = line_res {
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    continue;
                }

                if let Ok(parsed) = serde_json::from_str::<Value>(trimmed) {
                    let _ = app_stdout.emit("bot-event", json!({
                        "bot_id": bot_id_stdout,
                        "data": parsed
                    }));
                } else {
                    // Raw print line fallback as log
                    let _ = app_stdout.emit("bot-event", json!({
                        "bot_id": bot_id_stdout,
                        "data": {
                            "type": "log",
                            "level": "info",
                            "message": trimmed
                        }
                    }));
                }
            }
        }
    });

    // Spawn reader thread for stderr lines
    let app_stderr = app.clone();
    let bot_id_stderr = bot_id.clone();
    std::thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line_res in reader.lines() {
            if let Ok(line) = line_res {
                let trimmed = line.trim();
                if !trimmed.is_empty() {
                    let _ = app_stderr.emit("bot-event", json!({
                        "bot_id": bot_id_stderr,
                        "data": {
                            "type": "log",
                            "level": "warning",
                            "message": trimmed
                        }
                    }));
                }
            }
        }
    });

    Ok(json!({
        "status": "started",
        "pid": pid,
        "bot_id": bot_id,
        "python": python_exe.to_string_lossy()
    }))
}

fn force_kill_process_tree(pid: u32) {
    // No Windows, kill() sozinho às vezes deixa filhos CUDA/Python vivos e o próximo start trava
    #[cfg(target_os = "windows")]
    {
        let _ = Command::new("taskkill")
            .args(["/PID", &pid.to_string(), "/T", "/F"])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status();
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = pid;
    }
}

#[tauri::command]
pub fn bot_stop(bot_id: Option<String>) -> Result<Value, String> {
    let mgr_lock = get_manager();
    let mut mgr = mgr_lock.lock().map_err(|e| e.to_string())?;

    if let Some(ref mut stdin) = mgr.stdin {
        let stop_cmd = json!({ "type": "STOP" });
        let _ = stdin.write_all(format!("{}\n", stop_cmd).as_bytes());
        let _ = stdin.flush();
    }

    // Tempo para liberar teclas / sair do loop
    std::thread::sleep(std::time::Duration::from_millis(250));

    if let Some(ref mut child) = mgr.child {
        let pid = child.id();
        force_kill_process_tree(pid);
        let _ = child.kill();
        let _ = child.wait();
    }

    mgr.child = None;
    mgr.stdin = None;
    mgr.active_bot_id = None;
    mgr.started_at = None;
    mgr.status = "stopped".to_string();

    Ok(json!({ "status": "stopped", "bot_id": bot_id }))
}

#[tauri::command]
pub fn bot_pause() -> Result<Value, String> {
    let mgr_lock = get_manager();
    let mut mgr = mgr_lock.lock().map_err(|e| e.to_string())?;

    if let Some(ref mut stdin) = mgr.stdin {
        let pause_cmd = json!({ "type": "PAUSE" });
        let _ = stdin.write_all(format!("{}\n", pause_cmd).as_bytes());
        let _ = stdin.flush();
        mgr.status = "paused".to_string();
        Ok(json!({ "status": "paused" }))
    } else {
        Err("Nenhum bot em execução para pausar".to_string())
    }
}

#[tauri::command]
pub fn bot_resume() -> Result<Value, String> {
    let mgr_lock = get_manager();
    let mut mgr = mgr_lock.lock().map_err(|e| e.to_string())?;

    if let Some(ref mut stdin) = mgr.stdin {
        let resume_cmd = json!({ "type": "RESUME" });
        let _ = stdin.write_all(format!("{}\n", resume_cmd).as_bytes());
        let _ = stdin.flush();
        mgr.status = "running".to_string();
        Ok(json!({ "status": "running" }))
    } else {
        Err("Nenhum bot em execução para retomar".to_string())
    }
}

#[tauri::command]
pub fn bot_send_command(command: Value) -> Result<(), String> {
    let mgr_lock = get_manager();
    let mut mgr = mgr_lock.lock().map_err(|e| e.to_string())?;

    if let Some(ref mut stdin) = mgr.stdin {
        let _ = stdin.write_all(format!("{}\n", command).as_bytes());
        let _ = stdin.flush();
        Ok(())
    } else {
        Err("Nenhum bot em execução para receber comandos".to_string())
    }
}

#[tauri::command]
pub fn bot_get_status() -> Result<Value, String> {
    let mgr_lock = get_manager();
    let mut mgr = mgr_lock.lock().map_err(|e| e.to_string())?;

    let is_alive = if let Some(ref mut c) = mgr.child {
        match c.try_wait() {
            Ok(None) => true,
            _ => false,
        }
    } else {
        false
    };

    if !is_alive && mgr.status != "stopped" {
        mgr.status = "stopped".to_string();
        mgr.active_bot_id = None;
        mgr.child = None;
        mgr.stdin = None;
    }

    let uptime_secs = mgr.started_at.map(|t| t.elapsed().as_secs()).unwrap_or(0);

    Ok(json!({
        "status": mgr.status,
        "active_bot_id": mgr.active_bot_id,
        "uptime_secs": uptime_secs,
        "is_alive": is_alive
    }))
}

#[tauri::command]
pub fn bot_check_environment() -> Result<Value, String> {
    let root = resolve_project_root();
    let python_exe = resolve_python_path();
    let script = resolve_script_file("integrations/robloxbot/env_checker.py");

    let python_valid = Command::new(&python_exe)
        .arg("-c")
        .arg("import sys; print(sys.version)")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false);

    if !python_valid || !script.exists() {
        let hw_info = run_ps_hw();
        return Ok(json!({
            "status": "setup_required",
            "needs_setup": true,
            "message": "Ambiente dos bots ainda não inicializado neste computador. Clique em '⚡ Instalar Automaticamente (1 Clique)' acima para preparar tudo!",
            "checks": [
                {
                    "id": "python",
                    "name": "Python Runtime",
                    "status": if python_valid { "ok" } else { "warning" },
                    "message": if python_valid { "Python detectado no sistema operacional" } else { "Python precisa ser preparado" }
                },
                {
                    "id": "venv",
                    "name": "Ambiente Virtual Isolado",
                    "status": "warning",
                    "message": "Necessário criar bots-env com 1 clique"
                },
                {
                    "id": "gpu",
                    "name": "Aceleração por GPU & Hardware",
                    "status": "ok",
                    "gpuName": hw_info.gpu,
                    "cudaAvailable": false,
                    "message": format!("{} detectada no sistema operacional", hw_info.gpu)
                },
                {
                    "id": "dependencies",
                    "name": "Bibliotecas de Visão & IA",
                    "status": "warning",
                    "message": "Instalação automática disponível em 1 clique"
                }
            ],
            "summary": {
                "gpuName": hw_info.gpu,
                "cudaAvailable": false,
                "cpuName": hw_info.cpu,
                "needsSetup": true
            }
        }));
    }

    let python_path_env = format!(
        "{};{};{}",
        root.to_string_lossy(),
        root.join("sdk").to_string_lossy(),
        root.join("integrations").to_string_lossy()
    );

    let output = Command::new(&python_exe)
        .current_dir(&root)
        .env("PYTHONPATH", python_path_env)
        .arg(&script)
        .output()
        .map_err(|e| format!("Falha ao executar env_checker: {}", e))?;

    let out_str = String::from_utf8_lossy(&output.stdout);
    if let Ok(parsed) = serde_json::from_str::<Value>(&out_str) {
        Ok(parsed)
    } else {
        let hw_info = run_ps_hw();
        Ok(json!({
            "status": "setup_required",
            "needs_setup": true,
            "summary": {
                "gpuName": hw_info.gpu,
                "cudaAvailable": false,
                "cpuName": hw_info.cpu,
                "needsSetup": true
            }
        }))
    }
}

#[tauri::command]
pub fn bot_discover_models() -> Result<Value, String> {
    let root = resolve_project_root();
    let python_exe = resolve_python_path();
    let script = resolve_script_file("integrations/robloxbot/model_scanner.py");

    let python_path_env = format!(
        "{};{};{}",
        root.to_string_lossy(),
        root.join("sdk").to_string_lossy(),
        root.join("integrations").to_string_lossy()
    );

    let output = Command::new(&python_exe)
        .current_dir(&root)
        .env("PYTHONPATH", python_path_env)
        .arg(&script)
        .output()
        .map_err(|e| format!("Falha ao executar model_scanner: {}", e))?;

    let out_str = String::from_utf8_lossy(&output.stdout);
    if let Ok(parsed) = serde_json::from_str::<Value>(&out_str) {
        Ok(parsed)
    } else {
        Err(format!("Saída inválida do model_scanner: {}", out_str))
    }
}

#[tauri::command]
pub fn bot_list_capture_targets() -> Result<Value, String> {
    let root = resolve_project_root();
    let python_exe = resolve_python_path();
    let script = resolve_script_file("integrations/robloxbot/window_scanner.py");

    let python_path_env = format!(
        "{};{};{}",
        root.to_string_lossy(),
        root.join("sdk").to_string_lossy(),
        root.join("integrations").to_string_lossy()
    );

    let output = Command::new(&python_exe)
        .current_dir(&root)
        .env("PYTHONPATH", python_path_env)
        .arg(&script)
        .output()
        .map_err(|e| format!("Falha ao executar window_scanner: {}", e))?;

    let out_str = String::from_utf8_lossy(&output.stdout);
    if let Ok(parsed) = serde_json::from_str::<Value>(&out_str) {
        Ok(parsed)
    } else {
        Err(format!("Saída inválida do window_scanner: {}", out_str))
    }
}

pub fn bot_kill_all() {
    let mgr_lock = get_manager();
    let res = mgr_lock.lock();
    if let Ok(mut mgr) = res {
        if let Some(ref mut child) = mgr.child {
            let _ = child.kill();
            let _ = child.wait();
        }
        mgr.child = None;
        mgr.stdin = None;
        mgr.status = "stopped".to_string();
    }
}

/// Executa a instalação/preparação automática do runtime Python e dependências para os bots
#[tauri::command]
pub fn bot_setup_environment(app: AppHandle) -> Result<Value, String> {
    let setup_script = resolve_script_file("scripts/setup_bot_runtime.ps1");
    let req_file = resolve_script_file("runtime/python/requirements.txt");
    let req_arg = req_file.to_string_lossy().to_string();
    let script_str = setup_script.to_string_lossy().to_string();

    let app_handle = app.clone();

    std::thread::spawn(move || {
        #[cfg(target_os = "windows")]
        {
            use std::os::windows::process::CommandExt;
            const CREATE_NO_WINDOW: u32 = 0x08000000;

            let mut cmd = Command::new("powershell");
            cmd.args([
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                &script_str,
                "-ReqFile",
                &req_arg,
            ])
            .creation_flags(CREATE_NO_WINDOW)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

            if let Ok(mut child) = cmd.spawn() {
                if let Some(stdout) = child.stdout.take() {
                    let reader = BufReader::new(stdout);
                    for line in reader.lines().flatten() {
                        if line.starts_with("[SETUP_PROGRESS]") {
                            let parts: Vec<&str> = line[16..].trim().split('|').collect();
                            if parts.len() >= 3 {
                                let step = parts[0];
                                let percent: i32 = parts[1].parse().unwrap_or(0);
                                let msg = parts[2];
                                let _ = app_handle.emit("bot-setup-progress", json!({
                                    "step": step,
                                    "percent": percent,
                                    "message": msg
                                }));
                            }
                        }
                    }
                }
                let status = child.wait();
                let success = status.map(|s| s.success()).unwrap_or(false);
                let _ = app_handle.emit("bot-setup-finished", json!({
                    "success": success
                }));
            }
        }
    });

    Ok(json!({ "status": "started", "message": "Instalação do ambiente iniciada em segundo plano!" }))
}

