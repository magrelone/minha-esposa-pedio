# Teste de aplicacao real de wallpaper
$code = @"
using System;
using System.Runtime.InteropServices;
public class WinWallpaper {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@
Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue

$defaultWindowsWallpaper = "C:\Windows\Web\Wallpaper\Windows\img0.jpg"
if (Test-Path $defaultWindowsWallpaper) {
    Write-Host "Arquivo de wallpaper oficial existe: $defaultWindowsWallpaper"
    # SPI_SETDESKWALLPAPER = 20 (0x0014), SPIF_UPDATEINIFILE = 1, SPIF_SENDCHANGE = 2
    $res = [WinWallpaper]::SystemParametersInfo(20, 0, $defaultWindowsWallpaper, 3)
    Write-Host "SystemParametersInfo retornou: $res"
} else {
    Write-Host "Arquivo de wallpaper nao encontrado em C:\Windows"
}
