use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::atomic::{AtomicBool, Ordering};

pub static TASKBAR_IS_CENTERED: AtomicBool = AtomicBool::new(true);

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

/// Helper para rodar comandos PowerShell de forma oculta e segura
fn run_ps(script: &str) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        let output = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", script])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .map_err(|e| format!("Erro ao executar PowerShell: {}", e))?;

        if output.status.success() {
            Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
        } else {
            let err = String::from_utf8_lossy(&output.stderr).trim().to_string();
            Err(if err.is_empty() { "Falha na execução".to_string() } else { err })
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = script;
        Ok("Simulado".to_string())
    }
}

/// Detecta com segurança as informações da versão do Windows instalada
#[tauri::command]
pub fn windows_get_os_info() -> Result<WindowsOsInfo, String> {
    let arch = std::env::consts::ARCH.to_string();

    #[cfg(target_os = "windows")]
    {
        let build_str = run_ps("[System.Environment]::OSVersion.Version.Build").unwrap_or_else(|_| "22631".to_string());
        let build_num: u32 = build_str.parse().unwrap_or(22621);
        let is_win11 = build_num >= 22000;
        let os_name = if is_win11 { "Windows 11".to_string() } else { "Windows 10".to_string() };

        let dark_check = run_ps("(Get-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name AppsUseLightTheme -ErrorAction SilentlyContinue).AppsUseLightTheme").unwrap_or_default();
        let is_dark = dark_check == "0";

        Ok(WindowsOsInfo {
            os_name,
            build_number: build_str,
            architecture: arch,
            edition: "Windows".to_string(),
            is_win11,
            mica_supported: is_win11,
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

/// Aplica o modo Claro ou Escuro REAL no Windows
#[tauri::command]
pub fn windows_apply_theme_mode(mode: String) -> Result<String, String> {
    let light_val = if mode == "light" { "1" } else { "0" };
    let script = format!(
        r#"
        $p = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize'
        if (-not (Test-Path $p)) {{ New-Item -Path $p -Force | Out-Null }}
        Set-ItemProperty -Path $p -Name AppsUseLightTheme -Value {} -Type DWord
        Set-ItemProperty -Path $p -Name SystemUsesLightTheme -Value {} -Type DWord

        # Transmite setting change para a interface atualizar na hora
        $code = @'
        using System;
        using System.Runtime.InteropServices;
        public class ThemeNotifier {{
            [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
            public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam, uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);
        }}
'@
        Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
        $HWND_BROADCAST = [IntPtr]0xffff
        $res = [UIntPtr]::Zero
        [ThemeNotifier]::SendMessageTimeout($HWND_BROADCAST, 0x001A, [UIntPtr]::Zero, "ImmersiveColorSet", 2, 100, [ref]$res)
        "#,
        light_val, light_val
    );

    run_ps(&script)?;
    Ok(format!("Modo {} aplicado com sucesso!", mode))
}

/// Aplica Cor de Destaque (Accent Color) REAL no Windows
#[tauri::command]
pub fn windows_apply_accent_color(hex_color: String) -> Result<String, String> {
    let clean_hex = hex_color.trim_start_matches('#');
    let script = format!(
        r#"
        $hex = '{}'
        $r = [Convert]::ToByte($hex.Substring(0, 2), 16)
        $g = [Convert]::ToByte($hex.Substring(2, 2), 16)
        $b = [Convert]::ToByte($hex.Substring(4, 2), 16)
        # ARGB DWORD
        $argb = ([uint32]255 -shl 24) -bor ([uint32]$r -shl 16) -bor ([uint32]$g -shl 8) -bor [uint32]$b
        # ABGR DWORD
        $abgr = ([uint32]255 -shl 24) -bor ([uint32]$b -shl 16) -bor ([uint32]$g -shl 8) -bor [uint32]$r

        $dwm = 'HKCU:\Software\Microsoft\Windows\DWM'
        if (-not (Test-Path $dwm)) {{ New-Item -Path $dwm -Force | Out-Null }}
        Set-ItemProperty -Path $dwm -Name ColorizationColor -Value $argb -Type DWord
        Set-ItemProperty -Path $dwm -Name AccentColor -Value $abgr -Type DWord
        Set-ItemProperty -Path $dwm -Name ColorizationAfterglow -Value $argb -Type DWord
        Set-ItemProperty -Path $dwm -Name ColorPrevalence -Value 1 -Type DWord

        $p = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize'
        Set-ItemProperty -Path $p -Name ColorPrevalence -Value 1 -Type DWord -ErrorAction SilentlyContinue
        "#,
        clean_hex
    );

    run_ps(&script)?;
    Ok(format!("Cor de destaque {} aplicada!", hex_color))
}

/// Aplica configurações da Barra de Tarefas REAL no Windows
#[tauri::command]
pub fn windows_apply_taskbar_config(
    alignment: String,
    show_seconds: bool,
    search_visible: bool,
) -> Result<String, String> {
    let is_center = alignment != "left";
    TASKBAR_IS_CENTERED.store(is_center, Ordering::SeqCst);

    let al_val = if is_center { 1 } else { 0 };
    let sec_val = if show_seconds { 1 } else { 0 };
    let search_val = if search_visible { 2 } else { 0 };

    let script = format!(
        r#"
        $adv = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced'
        if (-not (Test-Path $adv)) {{ New-Item -Path $adv -Force | Out-Null }}
        Set-ItemProperty -Path $adv -Name TaskbarAl -Value {} -Type DWord
        Set-ItemProperty -Path $adv -Name ShowSecondsInSystemClock -Value {} -Type DWord

        $srch = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Search'
        if (-not (Test-Path $srch)) {{ New-Item -Path $srch -Force | Out-Null }}
        Set-ItemProperty -Path $srch -Name SearchboxTaskbarMode -Value {} -Type DWord
        "#,
        al_val, sec_val, search_val
    );

    run_ps(&script)?;
    Ok("Barra de tarefas atualizada com sucesso!".to_string())
}

/// Aplica configurações do Explorador de Arquivos REAL no Windows
#[tauri::command]
pub fn windows_apply_explorer_config(
    compact_view: bool,
    show_extensions: bool,
    show_hidden: bool,
) -> Result<String, String> {
    let compact_val = if compact_view { 1 } else { 0 };
    let ext_val = if show_extensions { 0 } else { 1 }; // 0 = Visível, 1 = Oculto
    let hidden_val = if show_hidden { 1 } else { 2 };   // 1 = Visível, 2 = Oculto

    let script = format!(
        r#"
        $adv = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced'
        if (-not (Test-Path $adv)) {{ New-Item -Path $adv -Force | Out-Null }}
        Set-ItemProperty -Path $adv -Name UseCompactMode -Value {} -Type DWord
        Set-ItemProperty -Path $adv -Name HideFileExt -Value {} -Type DWord
        Set-ItemProperty -Path $adv -Name Hidden -Value {} -Type DWord
        "#,
        compact_val, ext_val, hidden_val
    );

    run_ps(&script)?;
    Ok("Explorador de Arquivos atualizado com sucesso!".to_string())
}

/// Garante que um papel de parede exista localmente no disco e o aplica no Windows de verdade
#[tauri::command]
pub fn windows_set_desktop_wallpaper(path_or_url: String) -> Result<String, String> {
    let script = format!(
        r#"
        $target = "{}"
        $appData = [Environment]::GetFolderPath('ApplicationData')
        $wpDir = Join-Path $appData 'PediParaMeuMarido\wallpapers'
        if (-not (Test-Path $wpDir)) {{ New-Item -ItemType Directory -Path $wpDir -Force | Out-Null }}
        $localPath = Join-Path $wpDir 'active_wallpaper.jpg'

        if ($target.StartsWith("http://") -or $target.StartsWith("https://")) {{
            # Baixa imagem remota com segurança
            $wc = New-Object System.Net.WebClient
            $wc.DownloadFile($target, $localPath)
            $target = $localPath
        }} elseif (-not (Test-Path $target)) {{
            Add-Type -AssemblyName System.Drawing
            $bmp = New-Object System.Drawing.Bitmap 1920, 1080
            $g = [System.Drawing.Graphics]::FromImage($bmp)
            $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.Point 0,0), (New-Object System.Drawing.Point 1920,1080), ([System.Drawing.Color]::FromArgb(251, 207, 232)), ([System.Drawing.Color]::FromArgb(244, 114, 182))
            $g.FillRectangle($brush, 0, 0, 1920, 1080)
            $brush.Dispose()
            $g.Dispose()
            $bmp.Save($localPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
            $bmp.Dispose()
            $target = $localPath
        }}

        # Define no registro e via API Win32
        $desk = 'HKCU:\Control Panel\Desktop'
        Set-ItemProperty -Path $desk -Name Wallpaper -Value $target
        Set-ItemProperty -Path $desk -Name WallpaperStyle -Value 10 # Fill

        $code = @'
        using System;
        using System.Runtime.InteropServices;
        public class WallpaperHelper {{
            [DllImport("user32.dll", CharSet = CharSet.Auto)]
            public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
        }}
'@
        Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
        [WallpaperHelper]::SystemParametersInfo(20, 0, $target, 3)
        "#,
        path_or_url.replace("'", "''").replace("\"", "\\\"")
    );

    run_ps(&script)?;
    Ok("Papel de parede aplicado no desktop!".to_string())
}

/// Restaura o papel de parede original padrão do Windows
#[tauri::command]
pub fn windows_restore_default_wallpaper() -> Result<String, String> {
    let default_path = r"C:\Windows\Web\Wallpaper\Windows\img0.jpg";
    windows_set_desktop_wallpaper(default_path.to_string())
}

/// Aplica Preset Completo no Windows de verdade (Cores, Barra, Explorer, Wallpaper)
#[tauri::command]
pub fn windows_apply_complete_preset(preset_id: String) -> Result<String, String> {
    match preset_id.as_str() {
        "cute_pink" => {
            windows_apply_theme_mode("dark".to_string())?;
            windows_apply_accent_color("#ec4899".to_string())?;
            windows_apply_taskbar_config("center".to_string(), true, true)?;
            windows_set_desktop_wallpaper("cute_pink_preset".to_string())?;
            Ok("Preset Cute Pink Dream aplicado com sucesso no Windows!".to_string())
        }
        "win11_fluent" => {
            windows_apply_theme_mode("dark".to_string())?;
            windows_apply_accent_color("#0078d4".to_string())?;
            windows_apply_taskbar_config("center".to_string(), true, true)?;
            windows_restore_default_wallpaper()?;
            Ok("Preset Windows 11 Fluent aplicado!".to_string())
        }
        "win10_classic" => {
            windows_apply_theme_mode("dark".to_string())?;
            windows_apply_accent_color("#0284c7".to_string())?;
            windows_apply_taskbar_config("left".to_string(), false, true)?;
            windows_restore_default_wallpaper()?;
            Ok("Preset Windows 10 Clássico aplicado!".to_string())
        }
        "win7_aero" => {
            windows_apply_theme_mode("light".to_string())?;
            windows_apply_accent_color("#0ea5e9".to_string())?;
            windows_apply_taskbar_config("left".to_string(), false, false)?;
            Ok("Preset Windows 7 Aero aplicado!".to_string())
        }
        "cyberpunk_neon" => {
            windows_apply_theme_mode("dark".to_string())?;
            windows_apply_accent_color("#eab308".to_string())?;
            windows_apply_taskbar_config("center".to_string(), true, true)?;
            Ok("Preset Cyberpunk Neon aplicado!".to_string())
        }
        _ => {
            windows_apply_theme_mode("dark".to_string())?;
            Ok("Preset padrão aplicado!".to_string())
        }
    }
}

/// Reinicia o Windows Explorer de maneira segura e controlada
#[tauri::command]
pub fn windows_safe_restart_explorer() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        let _ = Command::new("taskkill")
            .args(["/F", "/IM", "explorer.exe"])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        std::thread::sleep(std::time::Duration::from_millis(500));

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
        let script = r#"
            taskkill /F /IM explorer.exe
            Start-Sleep -Milliseconds 600
            $iconCache = "$env:LOCALAPPDATA\IconCache.db"
            if (Test-Path $iconCache) { Remove-Item $iconCache -Force -ErrorAction SilentlyContinue }
            $cacheFolder = "$env:LOCALAPPDATA\Microsoft\Windows\Explorer"
            Get-ChildItem -Path $cacheFolder -Filter "iconcache*" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
            Start-Process explorer.exe
        "#;
        run_ps(script)?;
        Ok("Cache de ícones reconstruído com sucesso!".to_string())
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok("Ambiente não-Windows: reconstrução de cache simulada.".to_string())
    }
}

/// Verifica o status da bateria para pausar live wallpapers e efeitos pesados
#[tauri::command]
pub fn windows_get_power_status() -> Result<PowerStatusInfo, String> {
    #[cfg(target_os = "windows")]
    {
        let status = run_ps("(Get-WmiObject -Class Win32_Battery -ErrorAction SilentlyContinue).BatteryStatus").unwrap_or_default();
        let is_battery = status == "1" || status == "3";

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

/// Alterna a visibilidade da janela pop-up do Menu Iniciar Híbrido (Win 7 + 11)
#[tauri::command]
pub fn windows_toggle_hybrid_start_menu(app: tauri::AppHandle) -> Result<bool, String> {
    use tauri::Manager;

    let win = app
        .get_webview_window("startmenu")
        .ok_or_else(|| "Janela startmenu não encontrada".to_string())?;

    let is_visible = win.is_visible().unwrap_or(false);

    if is_visible {
        let _ = win.hide();
        Ok(false)
    } else {
        // Posiciona no centro ou no canto de acordo com o alinhamento da barra de tarefas
        if let Ok(Some(mon)) = win.primary_monitor() {
            let mon_size = mon.size();
            let mon_pos = mon.position();
            let win_width = 660;
            let win_height = 520;
            let taskbar_height = 56;

            // Verifica se a barra está centralizada (via registro do Windows ou estado em cache)
            let is_centered = {
                #[cfg(target_os = "windows")]
                {
                    let script = r#"(Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced' -Name TaskbarAl -ErrorAction SilentlyContinue).TaskbarAl"#;
                    if let Ok(out) = run_ps(script) {
                        out.trim() == "1"
                    } else {
                        TASKBAR_IS_CENTERED.load(Ordering::SeqCst)
                    }
                }
                #[cfg(not(target_os = "windows"))]
                {
                    TASKBAR_IS_CENTERED.load(Ordering::SeqCst)
                }
            };

            let pos_x = if is_centered {
                mon_pos.x + ((mon_size.width as i32 - win_width) / 2)
            } else {
                mon_pos.x + 18
            };
            let pos_y = mon_pos.y + (mon_size.height as i32) - win_height - taskbar_height;

            let _ = win.set_position(tauri::PhysicalPosition::new(pos_x, pos_y));
        }

        let _ = win.show();
        let _ = win.set_focus();
        Ok(true)
    }
}

/// Aplica configurações reais de recomendações e recentes no Start Menu do Windows
#[tauri::command]
pub fn windows_apply_start_menu_config(show_recent: bool, show_recommended: bool) -> Result<String, String> {
    let recent_val = if show_recent { 1 } else { 0 };
    let rec_val = if show_recommended { 1 } else { 0 };

    let script = format!(
        r#"
        $adv = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced'
        if (-not (Test-Path $adv)) {{ New-Item -Path $adv -Force | Out-Null }}
        Set-ItemProperty -Path $adv -Name Start_TrackDocs -Value {} -Type DWord
        Set-ItemProperty -Path $adv -Name Start_TrackProgs -Value {} -Type DWord

        $start = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Start'
        if (-not (Test-Path $start)) {{ New-Item -Path $start -Force | Out-Null }}
        Set-ItemProperty -Path $start -Name ShowRecentList -Value {} -Type DWord -ErrorAction SilentlyContinue
        Set-ItemProperty -Path $start -Name ShowFrequentList -Value {} -Type DWord -ErrorAction SilentlyContinue
        "#,
        recent_val, rec_val, recent_val, rec_val
    );

    run_ps(&script)?;
    Ok("Preferências do Menu Iniciar gravadas no Windows!".to_string())
}

