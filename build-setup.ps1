# ================================================================
#  💕 PEDI PARA MEU MARIDO - Gerador de Instalador Oficial (.exe)
# ================================================================

Write-Host ""
Write-Host "================================================================" -ForegroundColor Magenta
Write-Host "  💕 PEDI PARA MEU MARIDO - Criando Setup para a Esposa 💕" -ForegroundColor Magenta
Write-Host "================================================================" -ForegroundColor Magenta
Write-Host ""

# 1. Configurar PATH para o Rust/Cargo
$cargoPath = "$env:USERPROFILE\.cargo\bin"
if (Test-Path $cargoPath) {
    if ($env:PATH -notlike "*$cargoPath*") {
        $env:PATH = "$cargoPath;" + $env:PATH
        Write-Host "  [+] Cargo adicionado ao PATH temporário." -ForegroundColor Green
    }
}

# 2. Configurações essenciais para o Windows Defender não travar arquivos
$env:CARGO_BUILD_JOBS = 1

# 3. Liberar porta 1420
$occupied = Get-NetTCPConnection -LocalPort 1420 -ErrorAction SilentlyContinue
if ($occupied) {
    Write-Host "  [+] Liberando processos na porta 1420..." -ForegroundColor Yellow
    $occupied | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Milliseconds 500
}

# 4. Gerar build do frontend com Vite
Write-Host "  [1/2] Compilando frontend otimizado com Vite..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERRO] Falha ao compilar o frontend." -ForegroundColor Red
    exit 1
}

# 5. Gerar o instalador NSIS (.exe) do Windows
Write-Host "  [2/2] Gerando executável e instalador Setup (.exe)..." -ForegroundColor Cyan
npx tauri build --bundles nsis

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "  ✨ SUCESSO! O Setup para sua esposa foi gerado com amor! 💕" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host ""
    
    $bundleDir = "src-tauri\target\release\bundle\nsis"
    if (Test-Path $bundleDir) {
        $setupExe = Get-ChildItem -Path $bundleDir -Filter "*setup.exe" | Select-Object -First 1
        if ($setupExe) {
            Write-Host "  👉 Arquivo para enviar para ela:" -ForegroundColor Yellow
            Write-Host "     $($setupExe.FullName)" -ForegroundColor White
            Write-Host ""
            Write-Host "  [+] Abrindo pasta do instalador no Windows Explorer..." -ForegroundColor Cyan
            explorer.exe "/select,$($setupExe.FullName)"
        }
    }
} else {
    Write-Host "  [AVISO] Verifique se o NSIS concluiu ou se há arquivos bloqueados." -ForegroundColor Yellow
}
