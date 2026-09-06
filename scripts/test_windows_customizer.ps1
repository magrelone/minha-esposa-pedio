# Script de Teste das Personalizações Reais do Windows
Add-Type -AssemblyName System.Drawing

$appData = [Environment]::GetFolderPath('ApplicationData')
$wpDir = Join-Path $appData 'PediParaMeuMarido\wallpapers'
if (-not (Test-Path $wpDir)) {
    New-Item -ItemType Directory -Path $wpDir -Force | Out-Null
}

$wpPath = Join-Path $wpDir 'test_wallpaper_pink.jpg'

# 1. Gerar imagem real JPEG válida no disco
$bmp = New-Object System.Drawing.Bitmap 1920, 1080
$g = [System.Drawing.Graphics]::FromImage($bmp)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.Point 0,0), (New-Object System.Drawing.Point 1920,1080), ([System.Drawing.Color]::FromArgb(253, 164, 175)), ([System.Drawing.Color]::FromArgb(244, 63, 94))
$g.FillRectangle($brush, 0, 0, 1920, 1080)
$font = New-Object System.Drawing.Font 'Segoe UI', 40, [System.Drawing.FontStyle]::Bold
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$g.DrawString('Pedi para meu marido 💕', $font, $textBrush, 620, 480)
$g.Dispose()
$bmp.Save($wpPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp.Dispose()

Write-Host "Wallpaper gerado em: $wpPath (Existe: $(Test-Path $wpPath))"

# 2. Aplicar via Win32 API SystemParametersInfo
$code = @'
using System;
using System.Runtime.InteropServices;
public class WinCustomizer {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);

    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam, uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);
}
'@
Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue

# SPI_SETDESKWALLPAPER = 20, SPIF_UPDATEINIFILE = 1, SPIF_SENDCHANGE = 2 (1|2 = 3)
$res = [WinCustomizer]::SystemParametersInfo(20, 0, $wpPath, 3)
Write-Host "Resultado SystemParametersInfo Wallpaper: $res"
