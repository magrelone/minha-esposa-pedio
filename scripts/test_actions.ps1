# Teste de acoes nativas do Windows
Write-Host "=== TESTANDO ACOES NATIVAS DO WINDOWS ==="

# 1. Testar segundos no relogio da barra de tarefas
Write-Host "1. Ativando segundos no relogio..."
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "ShowSecondsInSystemClock" -Value 1 -Type DWord
$checkSeconds = (Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced").ShowSecondsInSystemClock
Write-Host "   ShowSecondsInSystemClock = $checkSeconds"

# 2. Testar alinhamento da barra de tarefas (0 = Esquerda, 1 = Centro)
Write-Host "2. Testando alinhamento da barra de tarefas..."
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "TaskbarAl" -Value 1 -Type DWord
$checkAl = (Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced").TaskbarAl
Write-Host "   TaskbarAl = $checkAl"

# 3. Testar modo claro/escuro
Write-Host "3. Verificando tema do sistema..."
$isDark = (Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize").AppsUseLightTheme
Write-Host "   AppsUseLightTheme = $isDark"

# 4. Testar opcoes do Explorer
Write-Host "4. Testando modo compacto e extensoes..."
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "HideFileExt" -Value 0 -Type DWord
$checkExt = (Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced").HideFileExt
Write-Host "   HideFileExt (0 = visivel) = $checkExt"

Write-Host "=== TESTE CONCLUIDO COM SUCESSO ==="
