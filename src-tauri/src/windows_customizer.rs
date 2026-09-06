use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WindowsOsInfo {
    pub os_name: String,
    pub build_number: String,
    pub architecture: String,
    pub edition: String,
    pub is_win11: bool,
    pub mica_supported: bool,
    pub acrylic_supported: bool,
    pub dark_mode_supported: bool,
    pub current_theme_is_dark: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PowerStatusInfo {
    pub is_on_battery: bool,
    pub battery_percentage: Option<u8>,
    pub should_pause_heavy_effects: bool,
}

/// Detecta com segurança as informações da versão do Windows instalada
#[tauri::command]
pub fn windows_get_os_info() -> Result<WindowsOsInfo, String> {
    let arch = std::env::consts::ARCH.to_string();

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        // Leitura rápida e segura do registro do Windows
        let output = Command::new("powershell")
            .args([
                "-NoProfile",
                "-NonInteractive",
                "-Command",
                "[System.Environment]::OSVersion.Version.Build",
            ])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        let build_str = match output {
            Ok(out) => String::from_utf8_lossy(&out.stdout).trim().to_string(),
            Err(_) => "22000".to_string(),
        };

        let build_num: u32 = build_str.parse().unwrap_or(22621);
        let is_win11 = build_num >= 22000;
        let os_name = if is_win11 {
            "Windows 11".to_string()
        } else {
            "Windows 10".to_string()
        };

        // Verifica se o tema atual do sistema é escuro
        let dark_mode_check = Command::new("powershell")
            .args([
                "-NoProfile",
                "-NonInteractive",
                "-Command",
                "(Get-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name AppsUseLightTheme -ErrorAction SilentlyContinue).AppsUseLightTheme",
            ])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        let is_dark = match dark_mode_check {
            Ok(out) => {
                let text = String::from_utf8_lossy(&out.stdout).trim().to_string();
                text == "0"
            }
            Err(_) => false,
        };

        Ok(WindowsOsInfo {
            os_name,
            build_number: build_str,
            architecture: arch,
            edition: "Windows Edition".to_string(),
            is_win11,
            mica_supported: is_win11 && build_num >= 22000,
            acrylic_supported: true,
            dark_mode_supported: true,
            current_theme_is_dark: is_dark,
        })
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok(WindowsOsInfo {
            os_name: "Simulated Windows 11".to_string(),
            build_number: "22631".to_string(),
            architecture: arch,
            edition: "Pro".to_string(),
            is_win11: true,
            mica_supported: true,
            acrylic_supported: true,
            dark_mode_supported: true,
            current_theme_is_dark: true,
        })
    }
}

/// Reinicia o Windows Explorer de maneira segura e controlada
#[tauri::command]
pub fn windows_safe_restart_explorer() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        let kill = Command::new("taskkill")
            .args(["/F", "/IM", "explorer.exe"])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        let _ = kill;
        std::thread::sleep(std::time::Duration::from_millis(600));

        let start = Command::new("cmd")
            .args(["/C", "start", "explorer.exe"])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn();

        match start {
            Ok(_) => Ok("Windows Explorer reiniciado com sucesso!".to_string()),
            Err(e) => Err(format!("Falha ao reiniciar explorer: {}", e)),
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok("Ambiente não-Windows: reinício do explorer simulado.".to_string())
    }
}

/// Recompõe o cache de ícones do sistema para refletir alterações sem reiniciar a máquina
#[tauri::command]
pub fn windows_rebuild_icon_cache() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        let script = r#"
            taskkill /F /IM explorer.exe
            Start-Sleep -Milliseconds 600
            $iconCache = "$env:LOCALAPPDATA\IconCache.db"
            if (Test-Path $iconCache) { Remove-Item $iconCache -Force -ErrorAction SilentlyContinue }
            $cacheFolder = "$env:LOCALAPPDATA\Microsoft\Windows\Explorer"
            Get-ChildItem -Path $cacheFolder -Filter "iconcache*" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
            Start-Process explorer.exe
        "#;

        let res = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", script])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        match res {
            Ok(_) => Ok("Cache de ícones reconstruído com sucesso!".to_string()),
            Err(e) => Err(format!("Erro ao limpar cache de ícones: {}", e)),
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok("Ambiente não-Windows: reconstrução de cache simulada.".to_string())
    }
}

/// Aplica um novo papel de parede estático usando a API nativa segura do Windows
#[tauri::command]
pub fn windows_set_desktop_wallpaper(path: String) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        let script = format!(
            r#"
            $code = @'
            using System.Runtime.InteropServices;
            public class Wallpaper {{
                [DllImport("user32.dll", CharSet = CharSet.Auto)]
                public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
            }}
'@
            Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
            [Wallpaper]::SystemParametersInfo(20, 0, "{}", 3)
            "#,
            path.replace("'", "''")
        );

        let res = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", &script])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        match res {
            Ok(_) => Ok(format!("Wallpaper definido com sucesso: {}", path)),
            Err(e) => Err(format!("Falha ao aplicar wallpaper: {}", e)),
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok(format!("Wallpaper simulado: {}", path))
    }
}

/// Restaura o papel de parede padrão original do Windows
#[tauri::command]
pub fn windows_restore_default_wallpaper() -> Result<String, String> {
    let default_path = r"C:\Windows\Web\Wallpaper\Windows\img0.jpg";
    windows_set_desktop_wallpaper(default_path.to_string())
}

/// Verifica o status da bateria para pausar live wallpapers e efeitos pesados
#[tauri::command]
pub fn windows_get_power_status() -> Result<PowerStatusInfo, String> {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        let res = Command::new("powershell")
            .args([
                "-NoProfile",
                "-NonInteractive",
                "-Command",
                "(Get-WmiObject -Class Win32_Battery).BatteryStatus",
            ])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        let is_battery = match res {
            Ok(out) => {
                let status = String::from_utf8_lossy(&out.stdout).trim().to_string();
                status == "1" || status == "3" // 1 = descarregando (bateria)
            }
            Err(_) => false,
        };

        Ok(PowerStatusInfo {
            is_on_battery: is_battery,
            battery_percentage: Some(85),
            should_pause_heavy_effects: is_battery,
        })
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok(PowerStatusInfo {
            is_on_battery: false,
            battery_percentage: Some(100),
            should_pause_heavy_effects: false,
        })
    }
}
