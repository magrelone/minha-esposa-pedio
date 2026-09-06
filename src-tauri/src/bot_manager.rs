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

fn resolve_project_root() -> PathBuf {
    // 1. Check relative to current working directory and parents
    let candidates = [
        PathBuf::from("."),
        PathBuf::from(".."),
        PathBuf::from("../.."),
    ];

    for candidate in &candidates {
        let check = candidate.join("integrations/robloxbot/adapter.py");
        if check.exists() {
            if let Ok(canon) = std::fs::canonicalize(candidate) {
                return normalize_path(canon);
            }
            return candidate.clone();
        }
    }

    // 2. Check ancestors of current executable
    if let Ok(exe_path) = std::env::current_exe() {
        let mut dir = exe_path;
        while dir.pop() {
            let check = dir.join("integrations/robloxbot/adapter.py");
            if check.exists() {
                if let Ok(canon) = std::fs::canonicalize(&dir) {
                    return normalize_path(canon);
                }
                return dir;
            }
        }
    }

    PathBuf::from(".")
}

fn resolve_python_path() -> PathBuf {
    let root = resolve_project_root();
    // 1. Check isolated virtualenv in runtime/python/bots-env
    let venv_path = root.join("runtime/python/bots-env/Scripts/python.exe");
    if venv_path.exists() {
        if let Ok(canon) = std::fs::canonicalize(&venv_path) {
            return normalize_path(canon);
        }
        return venv_path;
    }

    // 2. Fallback to system python
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
    let adapter_script = root.join("integrations/robloxbot/adapter.py");

    if !adapter_script.exists() {
        return Err(format!(
            "Script adaptador não encontrado: {:?}",
            adapter_script
        ));
    }

    // Spawn Python process with structured arguments and piped stdio (no shell injection)
    let mut child = Command::new(&python_exe)
        .current_dir(&root)
        .arg("-u") // unbuffered stdio
        .arg(&adapter_script)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Falha ao iniciar Python ({:?}): {}", python_exe, e))?;

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
    let script = root.join("integrations/robloxbot/env_checker.py");

    let output = Command::new(&python_exe)
        .current_dir(&root)
        .arg(&script)
        .output()
        .map_err(|e| format!("Falha ao executar env_checker: {}", e))?;

    let out_str = String::from_utf8_lossy(&output.stdout);
    if let Ok(parsed) = serde_json::from_str::<Value>(&out_str) {
        Ok(parsed)
    } else {
        Err(format!("Saída inválida do env_checker: {}", out_str))
    }
}

#[tauri::command]
pub fn bot_discover_models() -> Result<Value, String> {
    let root = resolve_project_root();
    let python_exe = resolve_python_path();
    let script = root.join("integrations/robloxbot/model_scanner.py");

    let output = Command::new(&python_exe)
        .current_dir(&root)
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
    let script = root.join("integrations/robloxbot/window_scanner.py");

    let output = Command::new(&python_exe)
        .current_dir(&root)
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
