use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::OnceLock;
use tauri::AppHandle;

pub static INTERCEPT_START_ENABLED: AtomicBool = AtomicBool::new(false);
static APP_HANDLE_HOLDER: OnceLock<AppHandle> = OnceLock::new();

#[tauri::command]
pub fn windows_set_start_menu_replacement(enabled: bool) -> Result<bool, String> {
    INTERCEPT_START_ENABLED.store(enabled, Ordering::SeqCst);
    Ok(enabled)
}

#[tauri::command]
pub fn windows_get_start_menu_replacement() -> Result<bool, String> {
    Ok(INTERCEPT_START_ENABLED.load(Ordering::SeqCst))
}

/// Inicializa o interceptador em background para que o botão Iniciar e a tecla Win abram o Menu Híbrido
pub fn init_start_menu_interceptor(app: AppHandle) {
    let _ = APP_HANDLE_HOLDER.set(app.clone());

    #[cfg(target_os = "windows")]
    {
        std::thread::spawn(move || {
            use windows_sys::Win32::Foundation::{HWND, LPARAM, WPARAM};
            use windows_sys::Win32::UI::WindowsAndMessaging::{
                GetClassNameW, GetForegroundWindow, GetWindowTextW, GetWindowThreadProcessId,
                ShowWindow, SW_HIDE, WM_CLOSE, PostMessageW,
            };

            let mut last_suppressed_hwnd = 0isize;
            let mut suppress_cooldown = std::time::Instant::now();

            loop {
                std::thread::sleep(std::time::Duration::from_millis(100));

                if !INTERCEPT_START_ENABLED.load(Ordering::SeqCst) {
                    continue;
                }

                unsafe {
                    let fg_hwnd: HWND = GetForegroundWindow();
                    if fg_hwnd == 0 {
                        continue;
                    }

                    // Verifica classe da janela
                    let mut class_buf = [0u16; 128];
                    let class_len = GetClassNameW(fg_hwnd, class_buf.as_mut_ptr(), 128);
                    let class_name = String::from_utf16_lossy(&class_buf[..class_len as usize]);

                    // Janela de Menu Iniciar do Windows 10/11
                    let is_start_class = class_name == "XamlExplorerHostIslandWindow"
                        || class_name == "StartMenuExperienceHost";

                    if is_start_class {
                        let mut pid = 0u32;
                        GetWindowThreadProcessId(fg_hwnd, &mut pid);

                        let mut title_buf = [0u16; 128];
                        let title_len = GetWindowTextW(fg_hwnd, title_buf.as_mut_ptr(), 128);
                        let title = String::from_utf16_lossy(&title_buf[..title_len as usize]);

                        let is_start_title = title.eq_ignore_ascii_case("iniciar")
                            || title.eq_ignore_ascii_case("start");

                        if is_start_title && (fg_hwnd != last_suppressed_hwnd || suppress_cooldown.elapsed().as_millis() > 500) {
                            last_suppressed_hwnd = fg_hwnd;
                            suppress_cooldown = std::time::Instant::now();

                            // 1. Fecha / esconde a janela nativa do Windows
                            ShowWindow(fg_hwnd, SW_HIDE);
                            PostMessageW(fg_hwnd, WM_CLOSE, 0 as WPARAM, 0 as LPARAM);

                            // 2. Abre a nossa janela flutuante no canto exato da barra de tarefas
                            if let Some(app_handle) = APP_HANDLE_HOLDER.get() {
                                let _ = crate::windows_customizer::windows_toggle_hybrid_start_menu(app_handle.clone());
                            }
                        }
                    }
                }
            }
        });
    }
}
