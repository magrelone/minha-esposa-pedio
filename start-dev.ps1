# ==============================================================================
# 💕 Pedi para meu marido - Inicializador de Desenvolvimento
# ==============================================================================
param (
    [switch]$BrowserOnly = $false
)

$Host.UI.RawUI.WindowTitle = "💕 Pedi para meu marido - Dev Server"
Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Magenta
Write-Host "     💕 PEDI PARA MEU MARIDO - Central de Projetos da Esposa 💕" -ForegroundColor Magenta
Write-Host "     🎯 Módulo Ativo: Crosshair Studio" -ForegroundColor Cyan
Write-Host "  ================================================================" -ForegroundColor Magenta
Write-Host ""

# 1. Checar Cargo / Rust
$cargoFound = Get-Command cargo -ErrorAction SilentlyContinue
if (-not $cargoFound) {
    $userCargo = "$env:USERPROFILE\.cargo\bin"
    if (Test-Path "$userCargo\cargo.exe") {
        Write-Host "  [+] Adicionando Cargo ($userCargo) ao PATH temporário..." -ForegroundColor Yellow
        $env:PATH = "$userCargo;$env:PATH"
    } else {
        Write-Host "  [!] Aviso: Cargo/Rust não encontrado no PATH nem em ~/.cargo/bin." -ForegroundColor Red
        Write-Host "      Se você desejar rodar o desktop nativo (Tauri), instale o Rust em https://rustup.rs" -ForegroundColor Gray
    }
} else {
    Write-Host "  [OK] Rust / Cargo detectado: $(cargo --version)" -ForegroundColor Green
}

# 2. Checar Node / npm
$nodeFound = Get-Command node -ErrorAction SilentlyContinue
$npmFound = Get-Command npm -ErrorAction SilentlyContinue

if (-not $nodeFound -or -not $npmFound) {
    Write-Host "  [ERRO] Node.js ou npm não foram encontrados no PATH!" -ForegroundColor Red
    Write-Host "         Instale o Node.js v18+ em https://nodejs.org/" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "  [OK] Node.js detectado: $(node --version)" -ForegroundColor Green
}

# 3. Checar dependências do npm
if (-not (Test-Path "node_modules")) {
    Write-Host "  [+] Instalando dependências do projeto (npm install)..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERRO] Falha ao instalar dependências do npm." -ForegroundColor Red
        exit 1
    }
}

# 4. Liberar porta 1420 e garantir que esteja 100% desocupada antes de prosseguir
$occupied = Get-NetTCPConnection -LocalPort 1420 -ErrorAction SilentlyContinue
if ($occupied) {
    Write-Host "  [+] Liberando porta 1420 ocupada por processo anterior..." -ForegroundColor Yellow
    $occupied | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    $retries = 15
    while ((Get-NetTCPConnection -LocalPort 1420 -ErrorAction SilentlyContinue) -and $retries -gt 0) {
        Start-Sleep -Milliseconds 400
        $retries--
    }
}

# 5. Configurar jobs de compilação seguros para o Windows Defender
$env:CARGO_BUILD_JOBS = 1


Write-Host ""
if ($BrowserOnly) {
    Write-Host "  [>] Iniciando modo somente navegador (Vite Dev)..." -ForegroundColor Cyan
    npm run dev
} else {
    Write-Host "  [>] Iniciando aplicativo desktop completo (Tauri Dev)..." -ForegroundColor Cyan
    Write-Host "      Pressione Ctrl+C para encerrar." -ForegroundColor Gray
    Write-Host ""
    npm run tauri dev
}

