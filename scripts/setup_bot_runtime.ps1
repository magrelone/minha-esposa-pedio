# ==============================================================================
#  💕 Pedi para meu marido - Instalador Automático de Dependências dos Bots
#  Prepara Python, venv isolado e bibliotecas de Visão/IA em qualquer PC Windows!
# ==============================================================================

param(
    [string]$ReqFile = ""
)

$ErrorActionPreference = 'Continue'

function Log-Step([string]$step, [int]$percent, [string]$msg) {
    Write-Host "[SETUP_PROGRESS] $($step)|$($percent)|$($msg)"
}

try {
    Log-Step "checking_python" 10 "Verificando se o Python está disponível no computador..."

    # 1. Localizar executável do Python no sistema
    $pythonCmd = $null
    if (Get-Command "py" -ErrorAction SilentlyContinue) {
        $testPy = (py -3 -c "import sys; print(sys.executable)" 2>$null)
        if ($testPy -and (Test-Path $testPy)) { $pythonCmd = "py -3" }
    }
    
    if (-not $pythonCmd -and (Get-Command "python" -ErrorAction SilentlyContinue)) {
        $testPy = (python -c "import sys; print(sys.executable)" 2>$null)
        if ($testPy -and (Test-Path $testPy)) { $pythonCmd = "python" }
    }

    # 2. Se não encontrar Python, instala silenciosamente
    if (-not $pythonCmd) {
        Log-Step "installing_python" 20 "Python não encontrado. Instalando Python 3.11 oficial silenciosamente..."
        
        $installedViaWinget = $false
        if (Get-Command "winget" -ErrorAction SilentlyContinue) {
            try {
                winget install Python.Python.3.11 --silent --accept-package-agreements --accept-source-agreements --disable-interactivity | Out-Null
                Start-Sleep -Seconds 3
                if (Get-Command "python" -ErrorAction SilentlyContinue) {
                    $pythonCmd = "python"
                    $installedViaWinget = $true
                }
            } catch {}
        }

        if (-not $installedViaWinget) {
            $installerUrl = "https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe"
            $installerPath = Join-Path $env:TEMP "python-3.11.9-setup.exe"
            
            Log-Step "downloading_python" 25 "Baixando instalador do Python 3.11..."
            $wc = New-Object System.Net.WebClient
            $wc.DownloadFile($installerUrl, $installerPath)

            Log-Step "running_python_installer" 35 "Executando instalação silenciosa do Python..."
            $p = Start-Process -FilePath $installerPath -ArgumentList "/quiet InstallAllUsers=0 PrependPath=1 Include_pip=1" -Wait -PassThru
            Start-Sleep -Seconds 2

            # Recarrega PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            
            if (Get-Command "python" -ErrorAction SilentlyContinue) {
                $pythonCmd = "python"
            } else {
                $defaultPyPath = "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe"
                if (Test-Path $defaultPyPath) {
                    $pythonCmd = "& `"$defaultPyPath`""
                } else {
                    throw "Não foi possível concluir a instalação do Python automaticamente. Instale o Python 3.10 ou 3.11 e marque 'Add Python to PATH'."
                }
            }
        }
    }

    Log-Step "creating_venv" 45 "Criando ambiente virtual isolado para os bots..."
    $appData = [System.Environment]::GetFolderPath('ApplicationData')
    $targetVenv = Join-Path $appData "PediParaMeuMarido\runtime\bots-env"
    $venvPython = Join-Path $targetVenv "Scripts\python.exe"
    $venvPip = Join-Path $targetVenv "Scripts\pip.exe"

    if (-not (Test-Path $venvPython)) {
        New-Item -ItemType Directory -Path (Split-Path $targetVenv) -Force -ErrorAction SilentlyContinue | Out-Null
        Invoke-Expression "$pythonCmd -m venv `"$targetVenv`""
    }

    if (-not (Test-Path $venvPython)) {
        throw "Falha ao criar ambiente virtual em $targetVenv"
    }

    Log-Step "updating_pip" 55 "Atualizando gerenciador de pacotes..."
    & $venvPython -m pip install --upgrade pip --quiet --no-warn-script-location 2>$null

    Log-Step "installing_dependencies" 65 "Instalando bibliotecas de Visão e IA (PyTorch, OpenCV, YOLO, Win32)..."

    # Localiza requirements.txt
    $reqPath = $ReqFile
    if (-not $reqPath -or (-not (Test-Path $reqPath))) {
        $candidates = @(
            Join-Path $PSScriptRoot "..\runtime\python\requirements.txt",
            Join-Path $PSScriptRoot "runtime\python\requirements.txt",
            Join-Path $PSScriptRoot "_up_\runtime\python\requirements.txt",
            Join-Path $PSScriptRoot "..\resources\_up_\runtime\python\requirements.txt",
            Join-Path $PSScriptRoot "requirements.txt",
            Join-Path $appData "PediParaMeuMarido\requirements.txt"
        )
        foreach ($c in $candidates) {
            if (Test-Path $c) { $reqPath = $c; break }
        }
    }

    if ($reqPath -and (Test-Path $reqPath)) {
        & $venvPip install -r "$reqPath" --no-warn-script-location
    } else {
        # Instala dependências centrais essenciais diretamente
        & $venvPip install opencv-python pillow numpy pywin32 pynput mss ultralytics torch torchvision --extra-index-url https://download.pytorch.org/whl/cpu --no-warn-script-location
    }

    Log-Step "testing_environment" 90 "Verificando se os módulos de IA estão operacionais..."
    $testResult = & $venvPython -c "import cv2, torch, ultralytics; print('ENV_OK')" 2>$null

    if ($testResult -match "ENV_OK") {
        Log-Step "completed" 100 "Ambiente dos bots preparado e pronto para uso!"
        Write-Output "SUCCESS: $venvPython"
    } else {
        Log-Step "completed_with_warning" 100 "Instalação finalizada com avisos. O sistema tentará executar normalmente."
        Write-Output "WARNING: $venvPython"
    }
} catch {
    Log-Step "error" 0 "Erro durante a instalação: $($_.Exception.Message)"
    Write-Error $_.Exception.Message
    exit 1
}
