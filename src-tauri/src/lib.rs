use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, PhysicalPosition, PhysicalSize,
};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

mod bot_manager;
use bot_manager::{
    bot_check_environment, bot_discover_models, bot_get_status, bot_kill_all, bot_list_capture_targets,
    bot_pause, bot_resume, bot_send_command, bot_start, bot_stop,
};

mod autoclick_engine;
mod autoclick_db;
mod windows_customizer;
use windows_customizer::{
    windows_get_os_info,
    windows_safe_restart_explorer,
    windows_rebuild_icon_cache,
    windows_set_desktop_wallpaper,
    windows_restore_default_wallpaper,
    windows_get_power_status,
    windows_apply_theme_mode,
    windows_apply_accent_color,
    windows_apply_taskbar_config,
    windows_apply_explorer_config,
    windows_apply_complete_preset,
};
use autoclick_engine::{AutoClickEngine, AutoClickEngineConfig, EngineStatus};
use autoclick_db::{AutoClickDatabase, AutoClickRunRecord};
use std::sync::OnceLock;

static AUTOCLICK_ENGINE: OnceLock<AutoClickEngine> = OnceLock::new();
static AUTOCLICK_DB: OnceLock<AutoClickDatabase> = OnceLock::new();

fn get_autoclick_engine() -> &'static AutoClickEngine {
    AUTOCLICK_ENGINE.get_or_init(AutoClickEngine::new)
}

fn get_autoclick_db(app: &AppHandle) -> &'static AutoClickDatabase {
    AUTOCLICK_DB.get_or_init(|| {
        let app_data = app.path().app_data_dir().unwrap_or_else(|_| std::path::PathBuf::from("."));
        let db_path = app_data.join("autoclick.sqlite");
        AutoClickDatabase::new(db_path).expect("Failed to initialize AutoClick SQLite database")
    })
}


static OVERLAY_ACTIVE: AtomicBool = AtomicBool::new(false);
static MINIMIZE_TO_TRAY: AtomicBool = AtomicBool::new(true);

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MonitorInfo {
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub scale_factor: f64,
    pub is_primary: bool,
    pub x: i32,
    pub y: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OverlayConfig {
    pub visible: bool,
    pub monitor_index: usize,
    pub offset_x: i32,
    pub offset_y: i32,
    pub size: u32,
}

#[tauri::command]
fn get_monitors(app: AppHandle) -> Result<Vec<MonitorInfo>, String> {
    let main_window = app
        .get_webview_window("main")
        .ok_or_else(|| "Main window not found".to_string())?;

    let monitors = main_window
        .available_monitors()
        .map_err(|e| e.to_string())?;

    let primary_monitor = main_window.primary_monitor().map_err(|e| e.to_string())?;

    let primary_pos = primary_monitor.as_ref().map(|m| m.position());

    let mut result = Vec::new();

    for (idx, mon) in monitors.into_iter().enumerate() {
        let size = mon.size();
        let pos = mon.position();
        let scale = mon.scale_factor();
        let is_primary = if let Some(ref p) = primary_pos {
            pos.x == p.x && pos.y == p.y
        } else {
            idx == 0
        };

        result.push(MonitorInfo {
            name: mon
                .name()
                .cloned()
                .unwrap_or_else(|| format!("Monitor {}", idx + 1)),
            width: size.width,
            height: size.height,
            scale_factor: scale,
            is_primary,
            x: pos.x,
            y: pos.y,
        });
    }

    if result.is_empty() {
        // Fallback default
        result.push(MonitorInfo {
            name: "Monitor Principal (1920x1080)".to_string(),
            width: 1920,
            height: 1080,
            scale_factor: 1.0,
            is_primary: true,
            x: 0,
            y: 0,
        });
    }

    Ok(result)
}

#[tauri::command]
fn set_overlay_state(app: AppHandle, config: OverlayConfig) -> Result<(), String> {
    OVERLAY_ACTIVE.store(config.visible, Ordering::SeqCst);

    if let Some(overlay) = app.get_webview_window("overlay") {
        if config.visible {
            // Apply click-through to allow seamless gaming
            let _ = overlay.set_ignore_cursor_events(true);
            let _ = overlay.set_always_on_top(true);

            // Position overlay on specified monitor
            let monitors = overlay.available_monitors().unwrap_or_default();
            let selected_monitor = monitors.get(config.monitor_index).or_else(|| monitors.first());

            let (mon_x, mon_y, mon_w, mon_h) = if let Some(m) = selected_monitor {
                let p = m.position();
                let s = m.size();
                (p.x, p.y, s.width, s.height)
            } else {
                (0, 0, 1920, 1080)
            };

            let win_size = config.size.max(200);
            let _ = overlay.set_size(PhysicalSize::new(win_size, win_size));

            let center_x = mon_x + (mon_w as i32 / 2) - (win_size as i32 / 2) + config.offset_x;
            let center_y = mon_y + (mon_h as i32 / 2) - (win_size as i32 / 2) + config.offset_y;

            let _ = overlay.set_position(PhysicalPosition::new(center_x, center_y));
            let _ = overlay.show();
        } else {
            let _ = overlay.hide();
        }
    }

    // Emit event to update frontend states
    let _ = app.emit("overlay-state-changed", config.visible);

    Ok(())
}

#[tauri::command]
fn toggle_overlay(app: AppHandle) -> Result<bool, String> {
    let current = OVERLAY_ACTIVE.load(Ordering::SeqCst);
    let next = !current;
    OVERLAY_ACTIVE.store(next, Ordering::SeqCst);

    if let Some(overlay) = app.get_webview_window("overlay") {
        if next {
            let _ = overlay.set_ignore_cursor_events(true);
            let _ = overlay.set_always_on_top(true);
            let _ = overlay.show();
        } else {
            let _ = overlay.hide();
        }
    }

    let _ = app.emit("overlay-state-changed", next);
    Ok(next)
}


#[tauri::command]
fn set_minimize_to_tray(enabled: bool) {
    MINIMIZE_TO_TRAY.store(enabled, Ordering::SeqCst);
}

#[tauri::command]
fn show_main_window(app: AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.show();
        let _ = win.unminimize();
        let _ = win.set_focus();
    }
    Ok(())
}

#[tauri::command]
fn hide_main_window(app: AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.hide();
    }
    Ok(())
}

#[tauri::command]
fn register_custom_hotkey(app: AppHandle, key: String) -> Result<(), String> {
    let key_upper = key.trim().to_uppercase();
    if key_upper == "ESC" || key_upper == "ESCAPE" {
        return Ok(());
    }

    if let Ok(sc) = key.parse::<Shortcut>() {
        let ah = app.clone();
        let _ = app.global_shortcut().on_shortcut(sc.clone(), move |_app, _shortcut, event| {
            if event.state() == ShortcutState::Pressed {
                let _ = toggle_overlay(ah.clone());
            }
        });
        let _ = app.global_shortcut().register(sc);
    }
    Ok(())
}

#[tauri::command]
fn autoclick_register_hotkey(app: AppHandle, key: String) -> Result<(), String> {
    let key_upper = key.trim().to_uppercase();
    if key_upper == "ESC" || key_upper == "ESCAPE" {
        return Ok(());
    }

    if let Ok(sc) = key.parse::<Shortcut>() {
        let ah = app.clone();
        let _ = app.global_shortcut().on_shortcut(sc.clone(), move |_app, _shortcut, event| {
            if event.state() == ShortcutState::Pressed {
                let engine = get_autoclick_engine();
                if engine.get_status().running {
                    // Parada forçada imediata e liberação de todas as teclas/botões
                    engine.stop(Some("Atalho Global (Parar)".to_string()));
                    autoclick_engine::AutoClickEngine::release_all_inputs_native();
                    let _ = ah.emit("autoclick-status-changed", false);
                } else {
                    let _ = ah.emit("autoclick-start-requested", ());
                }
            }
        });
        let _ = app.global_shortcut().register(sc);
    }
    Ok(())
}

#[tauri::command]
fn autoclick_register_emergency_hotkey(app: AppHandle, key: String) -> Result<(), String> {
    let key_upper = key.trim().to_uppercase();
    // NUNCA registrar ESC/ESCAPE isolado globalmente: no Windows, RegisterHotKey consome
    // a tecla exclusivamente em nível de SO, impedindo qualquer jogo de receber o ESC!
    if key_upper == "ESC" || key_upper == "ESCAPE" {
        return Ok(());
    }

    if let Ok(sc) = key.parse::<Shortcut>() {
        let ah = app.clone();
        let _ = app.global_shortcut().on_shortcut(sc.clone(), move |_app, _shortcut, event| {
            if event.state() == ShortcutState::Pressed {
                let engine = get_autoclick_engine();
                if engine.get_status().running {
                    engine.emergency_stop();
                    autoclick_engine::AutoClickEngine::release_all_inputs_native();
                    let _ = ah.emit("autoclick-status-changed", false);
                }
            }
        });
        let _ = app.global_shortcut().register(sc);
    }
    Ok(())
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WindowInfo {
    pub hwnd: usize,
    pub title: String,
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
    pub is_minimized: bool,
}

#[tauri::command]
fn autoclick_start(config: AutoClickEngineConfig) -> Result<(), String> {
    get_autoclick_engine().start(config)
}

#[tauri::command]
fn autoclick_stop() -> Result<(), String> {
    get_autoclick_engine().stop(Some("Usuário parou".to_string()));
    Ok(())
}

#[tauri::command]
fn autoclick_pause() -> Result<(), String> {
    get_autoclick_engine().pause();
    Ok(())
}

#[tauri::command]
fn autoclick_resume() -> Result<(), String> {
    get_autoclick_engine().resume();
    Ok(())
}

#[tauri::command]
fn autoclick_get_status() -> Result<EngineStatus, String> {
    Ok(get_autoclick_engine().get_status())
}

#[tauri::command]
fn autoclick_emergency_stop() -> Result<(), String> {
    get_autoclick_engine().emergency_stop();
    Ok(())
}

#[tauri::command]
fn autoclick_get_cursor_pos() -> Result<(i32, i32), String> {
    Ok(autoclick_engine::AutoClickEngine::get_cursor_pos_native())
}

#[tauri::command]
fn autoclick_get_windows() -> Result<Vec<WindowInfo>, String> {
    let mut windows = Vec::new();
    #[cfg(windows)]
    {
        use windows_sys::Win32::Foundation::{BOOL, HWND, LPARAM, RECT};
        use windows_sys::Win32::UI::WindowsAndMessaging::{
            EnumWindows, GetWindowRect, GetWindowTextW, IsIconic, IsWindowVisible,
        };

        unsafe extern "system" fn enum_proc(hwnd: HWND, lparam: LPARAM) -> BOOL {
            let list = &mut *(lparam as *mut Vec<WindowInfo>);
            if IsWindowVisible(hwnd) != 0 {
                let mut buf = [0u16; 512];
                let len = GetWindowTextW(hwnd, buf.as_mut_ptr(), 512);
                if len > 0 {
                    let title = String::from_utf16_lossy(&buf[..len as usize]);
                    if !title.trim().is_empty() && !title.contains("Default IME") && !title.contains("MSCTFIME UI") {
                        let mut rect = RECT { left: 0, top: 0, right: 0, bottom: 0 };
                        GetWindowRect(hwnd, &mut rect);
                        let is_minimized = IsIconic(hwnd) != 0;
                        list.push(WindowInfo {
                            hwnd: hwnd as usize,
                            title,
                            x: rect.left,
                            y: rect.top,
                            width: (rect.right - rect.left).max(0),
                            height: (rect.bottom - rect.top).max(0),
                            is_minimized,
                        });
                    }
                }
            }
            1
        }

        unsafe {
            EnumWindows(Some(enum_proc), &mut windows as *mut Vec<WindowInfo> as LPARAM);
        }
    }
    Ok(windows)
}

#[tauri::command]
fn autoclick_record_history(app: AppHandle, record: AutoClickRunRecord) -> Result<(), String> {
    let db = get_autoclick_db(&app);
    db.insert_history(&record).map_err(|e| e.to_string())
}

#[tauri::command]
fn autoclick_get_history(app: AppHandle, limit: Option<usize>) -> Result<Vec<AutoClickRunRecord>, String> {
    let db = get_autoclick_db(&app);
    db.get_recent_history(limit.unwrap_or(50)).map_err(|e| e.to_string())
}

#[tauri::command]
fn autoclick_clear_history(app: AppHandle) -> Result<(), String> {
    let db = get_autoclick_db(&app);
    db.clear_history().map_err(|e| e.to_string())
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UpdateProgressPayload {
    pub status: String,
    pub percent: f32,
    pub message: String,
}

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn open_external_url(url: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/c", "start", "", &url])
            .spawn()
            .map_err(|e| format!("Erro ao abrir link: {}", e))?;
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = url;
    }
    Ok(())
}

#[tauri::command]
async fn download_and_run_installer(app: AppHandle, url: String) -> Result<(), String> {
    let app_handle = app.clone();

    std::thread::spawn(move || {
        let temp_dir = std::env::temp_dir();
        let target_path = temp_dir.join("PediParaMeuMarido_Setup_Update.exe");

        let _ = app_handle.emit("update-download-progress", UpdateProgressPayload {
            status: "downloading".to_string(),
            percent: 15.0,
            message: "Iniciando download com carinho... 💕".to_string(),
        });

        // Usar curl nativo do Windows para baixar com suporte a redirects (GitHub Releases / AWS S3)
        let status = std::process::Command::new("curl.exe")
            .args(["-L", "-f", "-o", target_path.to_str().unwrap_or_default(), &url])
            .status();

        match status {
            Ok(s) if s.success() && target_path.exists() => {
                let _ = app_handle.emit("update-download-progress", UpdateProgressPayload {
                    status: "ready".to_string(),
                    percent: 100.0,
                    message: "Download concluído! Abrindo instalador... ✨".to_string(),
                });

                std::thread::sleep(std::time::Duration::from_millis(800));

                if let Ok(_) = std::process::Command::new(&target_path).spawn() {
                    std::thread::sleep(std::time::Duration::from_millis(1000));
                    app_handle.exit(0);
                } else {
                    let _ = app_handle.emit("update-download-progress", UpdateProgressPayload {
                        status: "error".to_string(),
                        percent: 0.0,
                        message: "Não foi possível iniciar o instalador automaticamente.".to_string(),
                    });
                }
            }
            _ => {
                let _ = app_handle.emit("update-download-progress", UpdateProgressPayload {
                    status: "error".to_string(),
                    percent: 0.0,
                    message: "Falha ao baixar atualização. Você também pode baixar pelo navegador! 💕".to_string(),
                });
            }
        }
    });

    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--minimized"]),
        ))
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            get_monitors,
            set_overlay_state,
            toggle_overlay,
            set_minimize_to_tray,
            show_main_window,
            hide_main_window,
            register_custom_hotkey,
            bot_start,
            bot_stop,
            bot_pause,
            bot_resume,
            bot_send_command,
            bot_get_status,
            bot_check_environment,
            bot_discover_models,
            bot_list_capture_targets,
            autoclick_start,
            autoclick_stop,
            autoclick_pause,
            autoclick_resume,
            autoclick_get_status,
            autoclick_emergency_stop,
            autoclick_get_cursor_pos,
            autoclick_get_windows,
            autoclick_record_history,
            autoclick_get_history,
            autoclick_clear_history,
            autoclick_register_hotkey,
            autoclick_register_emergency_hotkey,
            get_app_version,
            open_external_url,
            download_and_run_installer,
            windows_get_os_info,
            windows_safe_restart_explorer,
            windows_rebuild_icon_cache,
            windows_set_desktop_wallpaper,
            windows_restore_default_wallpaper,
            windows_get_power_status,
            windows_apply_theme_mode,
            windows_apply_accent_color,
            windows_apply_taskbar_config,
            windows_apply_explorer_config,
            windows_apply_complete_preset,
        ])

        .setup(|app| {
            // Build system tray menu
            let toggle_app_i =
                MenuItem::with_id(app, "toggle_app", "Abrir / Ocultar Central", true, None::<&str>)?;
            let toggle_crosshair_i = MenuItem::with_id(
                app,
                "toggle_crosshair",
                "🎯 Alternar Crosshair (Overlay)",
                true,
                None::<&str>,
            )?;
            let quit_i = MenuItem::with_id(app, "quit", "Sair", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&toggle_app_i, &toggle_crosshair_i, &quit_i])?;

            let mut tray_builder = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("💕 Pedi para meu marido")
                .show_menu_on_left_click(false);

            if let Some(icon) = app.default_window_icon() {
                tray_builder = tray_builder.icon(icon.clone());
            }

            let _tray = tray_builder
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "toggle_app" => {
                        if let Some(win) = app.get_webview_window("main") {
                            if win.is_visible().unwrap_or(false) {
                                let _ = win.hide();
                            } else {
                                let _ = win.show();
                                let _ = win.unminimize();
                                let _ = win.set_focus();
                            }
                        }
                    }
                    "toggle_crosshair" => {
                        let _ = toggle_overlay(app.clone());
                    }
                    "quit" => {
                        bot_kill_all();
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(win) = app.get_webview_window("main") {
                            if win.is_visible().unwrap_or(false) {
                                let _ = win.hide();
                            } else {
                                let _ = win.show();
                                let _ = win.unminimize();
                                let _ = win.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            // Setup overlay window initial click-through
            if let Some(overlay) = app.get_webview_window("overlay") {
                let _ = overlay.set_ignore_cursor_events(true);
            }

            // Register AutoClick Default Global Shortcut: "Insert"
            if let Ok(sc) = "Insert".parse::<Shortcut>() {
                let ah = app.handle().clone();
                let _ = app.global_shortcut().on_shortcut(sc.clone(), move |_app, _shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        let engine = get_autoclick_engine();
                        if engine.get_status().running {
                            // Parada forçada imediata e liberação de todas as teclas/botões
                            engine.stop(Some("Atalho Global Insert (Parar)".to_string()));
                            autoclick_engine::AutoClickEngine::release_all_inputs_native();
                            let _ = ah.emit("autoclick-status-changed", false);
                        } else {
                            let _ = ah.emit("autoclick-start-requested", ());
                        }
                    }
                });
                let _ = app.global_shortcut().register(sc);
            }

            // Register Emergency Stop Shortcut: "Shift+Escape" (não bloqueia o ESC isolado nos jogos)
            if let Ok(sc) = "Shift+Escape".parse::<Shortcut>() {
                let ah = app.handle().clone();
                let _ = app.global_shortcut().on_shortcut(sc.clone(), move |_app, _shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        let engine = get_autoclick_engine();
                        if engine.get_status().running {
                            engine.emergency_stop();
                            autoclick_engine::AutoClickEngine::release_all_inputs_native();
                            let _ = ah.emit("autoclick-status-changed", false);
                        }
                    }
                });
                let _ = app.global_shortcut().register(sc);
            }

            // Register Global Crosshair Overlay Shortcuts (dedicated only to overlay)
            let crosshair_hotkeys = ["F10", "Control+Alt+X"];
            for key in crosshair_hotkeys {
                if let Ok(sc) = key.parse::<Shortcut>() {
                    let ah = app.handle().clone();
                    let _ = app.global_shortcut().on_shortcut(sc.clone(), move |_app, _shortcut, event| {
                        if event.state() == ShortcutState::Pressed {
                            let _ = toggle_overlay(ah.clone());
                        }
                    });
                    let _ = app.global_shortcut().register(sc);
                }
            }

            let app_hotkeys = ["Control+H", "Control+Alt+C"];
            for key in app_hotkeys {
                if let Ok(sc) = key.parse::<Shortcut>() {
                    let ah = app.handle().clone();
                    let _ = app.global_shortcut().on_shortcut(sc.clone(), move |_app, _shortcut, event| {
                        if event.state() == ShortcutState::Pressed {
                            if let Some(win) = ah.get_webview_window("main") {
                                if win.is_visible().unwrap_or(false) {
                                    let _ = win.hide();
                                } else {
                                    let _ = win.show();
                                    let _ = win.unminimize();
                                    let _ = win.set_focus();
                                }
                            }
                        }
                    });
                    let _ = app.global_shortcut().register(sc);
                }
            }

            Ok(())
        })


        .on_window_event(|window, event| {
            if window.label() == "main" {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    if MINIMIZE_TO_TRAY.load(Ordering::SeqCst) {
                        // Prevent closing and minimize to tray
                        api.prevent_close();
                        let _ = window.hide();
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
