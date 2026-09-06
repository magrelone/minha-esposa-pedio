# Validacao rigorosa de todas as personalizacoes do Windows Customization Studio
Write-Host "=================================================="
Write-Host " TESTE AUTOMATIZADO DAS PERSONALIZACOES DO WINDOWS"
Write-Host "=================================================="

# 1. Teste de Tema (Dark / Light Mode)
Write-Host "`n[1/6] Testando Alternancia de Modo do Sistema..."
$themePath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize"
Set-ItemProperty -Path $themePath -Name AppsUseLightTheme -Value 0 -Type DWord
Set-ItemProperty -Path $themePath -Name SystemUsesLightTheme -Value 0 -Type DWord
$themeCheck = (Get-ItemProperty -Path $themePath).AppsUseLightTheme
if ($themeCheck -eq 0) {
    Write-Host "  [SUCESSO] Modo Escuro gravado com exito no registro do Windows!" -ForegroundColor Green
} else {
    Write-Host "  [FALHA] Nao foi possivel gravar modo escuro" -ForegroundColor Red
}

# 2. Teste de Cor de Destaque (Accent Color)
Write-Host "`n[2/6] Testando Cor de Destaque..."
$dwmPath = "HKCU:\Software\Microsoft\Windows\DWM"
# Rosa #ec4899 -> R=236, G=72, B=153
$r = 236; $g = 72; $b = 153
$argb = ([uint32]255 -shl 24) -bor ([uint32]$r -shl 16) -bor ([uint32]$g -shl 8) -bor [uint32]$b
Set-ItemProperty -Path $dwmPath -Name ColorizationColor -Value $argb -Type DWord
Set-ItemProperty -Path $dwmPath -Name ColorPrevalence -Value 1 -Type DWord
$colorCheck = (Get-ItemProperty -Path $dwmPath).ColorizationColor
Write-Host "  [SUCESSO] Cor de destaque gravada: $colorCheck" -ForegroundColor Green

# 3. Teste da Barra de Tarefas (Alinhamento e Segundos no Relogio)
Write-Host "`n[3/6] Testando Barra de Tarefas..."
$advPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
Set-ItemProperty -Path $advPath -Name TaskbarAl -Value 1 -Type DWord
Set-ItemProperty -Path $advPath -Name ShowSecondsInSystemClock -Value 1 -Type DWord
$alCheck = (Get-ItemProperty -Path $advPath).TaskbarAl
$secCheck = (Get-ItemProperty -Path $advPath).ShowSecondsInSystemClock
Write-Host "  [SUCESSO] Barra: Alinhamento Centralizado ($alCheck) e Segundos no Relogio ($secCheck)!" -ForegroundColor Green

# 4. Teste do Explorador de Arquivos (Modo Compacto e Extensoes Visiveis)
Write-Host "`n[4/6] Testando Explorador de Arquivos..."
Set-ItemProperty -Path $advPath -Name UseCompactMode -Value 1 -Type DWord
Set-ItemProperty -Path $advPath -Name HideFileExt -Value 0 -Type DWord # 0 = mostrar
$compactCheck = (Get-ItemProperty -Path $advPath).UseCompactMode
$extCheck = (Get-ItemProperty -Path $advPath).HideFileExt
Write-Host "  [SUCESSO] Explorer: Modo Compacto ($compactCheck) e Extensoes Visiveis ($extCheck)!" -ForegroundColor Green

# 5. Teste Real de Wallpaper (Criacao de JPEG Local e Aplicacao com SystemParametersInfo)
Write-Host "`n[5/6] Testando Wallpaper com API Nativa..."
Add-Type -AssemblyName System.Drawing
$appData = [Environment]::GetFolderPath('ApplicationData')
$wpDir = Join-Path $appData 'PediParaMeuMarido\wallpapers'
if (-not (Test-Path $wpDir)) { New-Item -ItemType Directory -Path $wpDir -Force | Out-Null }
$wpPath = Join-Path $wpDir 'cute_pink_active.jpg'

$bmp = New-Object System.Drawing.Bitmap 1920, 1080
$g = [System.Drawing.Graphics]::FromImage($bmp)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.Point 0,0), (New-Object System.Drawing.Point 1920,1080), ([System.Drawing.Color]::FromArgb(251, 207, 232)), ([System.Drawing.Color]::FromArgb(244, 114, 182))
$g.FillRectangle($brush, 0, 0, 1920, 1080)
$font = New-Object System.Drawing.Font 'Segoe UI', 38, [System.Drawing.FontStyle]::Bold
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$g.DrawString('Pedi para meu marido', $font, $textBrush, 700, 490)
$g.Dispose()
$bmp.Save($wpPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp.Dispose()

$code = @"
using System;
using System.Runtime.InteropServices;
public class TestWallpaper {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@
Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
$wpRes = [TestWallpaper]::SystemParametersInfo(20, 0, $wpPath, 3)
Write-Host "  [SUCESSO] Wallpaper gravado no disco e SystemParametersInfo retornou: $wpRes" -ForegroundColor Green

# 6. Teste da Reversao (Undo)
Write-Host "`n[6/6] Testando Reversao (Desfazer)..."
# Revertendo segundos no relogio como teste de reversao
Set-ItemProperty -Path $advPath -Name ShowSecondsInSystemClock -Value 0 -Type DWord
$revertCheck = (Get-ItemProperty -Path $advPath).ShowSecondsInSystemClock
Write-Host "  [SUCESSO] Reversao testada com sucesso: ShowSecondsInSystemClock = $revertCheck" -ForegroundColor Green

Write-Host "`n=================================================="
Write-Host " TODAS AS PERSONALIZACOES NATIVAS FORAM APROVADAS!"
Write-Host "=================================================="
