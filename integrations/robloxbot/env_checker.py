import sys
import os
import json
import subprocess
from pathlib import Path

def check_environment():
    base_dir = Path(__file__).resolve().parent
    weights_dir = base_dir / "vendor" / "bots" / "mm2_yolo_coin_collector" / "weights"

    checks = []

    # 1. Python version
    py_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    py_ok = sys.version_info.major == 3 and sys.version_info.minor in [8, 9, 10, 11, 12]
    checks.append({
        "id": "python",
        "name": "Python Runtime",
        "status": "ok" if py_ok else "warning",
        "version": py_version,
        "path": sys.executable,
        "message": f"Python {py_version} operacional" if py_ok else f"Python {py_version} pode ter incompatibilidades",
    })

    # 2. Virtualenv check
    in_venv = sys.prefix != sys.base_prefix
    checks.append({
        "id": "venv",
        "name": "Ambiente Virtual Isolado",
        "status": "ok" if in_venv else "info",
        "path": sys.prefix,
        "message": "Executando em ambiente virtual isolado (bots-env)" if in_venv else "Executando no Python do sistema",
    })

    # 3. GPU & CUDA Detection
    gpu_name = "Nenhuma GPU dedicada detectada"
    cuda_available = False
    cuda_version = "N/A"
    torch_version = "Não instalado"

    # Check via PyTorch first
    try:
        import torch
        torch_version = torch.__version__
        cuda_available = torch.cuda.is_available()
        if cuda_available:
            gpu_name = torch.cuda.get_device_name(0)
            cuda_version = torch.version.cuda or "Desconhecida"
    except Exception as e:
        torch_version = f"Erro ao importar: {e}"

    # If PyTorch doesn't have CUDA enabled, check system via nvidia-smi
    if not cuda_available:
        try:
            smi_output = subprocess.check_output(
                ["nvidia-smi", "--query-gpu=name,driver_version", "--format=csv,noheader"],
                stderr=subprocess.DEVNULL,
                text=True
            ).strip()
            if smi_output:
                gpu_name = smi_output.split(",")[0].strip()
        except Exception:
            pass

    checks.append({
        "id": "gpu",
        "name": "Aceleração por GPU",
        "status": "ok" if cuda_available else ("warning" if "NVIDIA" in gpu_name else "error"),
        "gpuName": gpu_name,
        "cudaAvailable": cuda_available,
        "cudaVersion": cuda_version,
        "torchVersion": torch_version,
        "message": f"{gpu_name} (CUDA ativo)" if cuda_available else (
            f"{gpu_name} detectada, mas PyTorch está em modo CPU fallback" if "NVIDIA" in gpu_name
            else "GPU CUDA não detectada. O bot poderá ficar lento com YOLO."
        ),
    })

    # 4. Critical Dependencies
    packages = {
        "torch": "PyTorch (Deep Learning / YOLO)",
        "torchvision": "TorchVision (Processamento de Imagens)",
        "cv2": "OpenCV (Visão Computacional)",
        "PIL": "Pillow (Captura de tela)",
        "pynput": "Pynput (Simulador de Teclado/Mouse)",
        "matplotlib": "Matplotlib (Visualização e métricas YOLO)",
        "scipy": "SciPy (Processamento e utilitários de sinal)",
        "win32gui": "PyWin32 (Identificação e captura de janelas)",
        "yaml": "PyYAML (Configurações YOLO)",
        "tqdm": "TQDM (Barras de progresso e utilitários)",
    }

    dep_status = []
    all_deps_ok = True
    for mod_name, label in packages.items():
        try:
            __import__(mod_name)
            dep_status.append({"module": mod_name, "label": label, "installed": True})
        except ImportError:
            dep_status.append({"module": mod_name, "label": label, "installed": False})
            all_deps_ok = False

    checks.append({
        "id": "dependencies",
        "name": "Dependências do RobloxBot",
        "status": "ok" if all_deps_ok else "warning",
        "details": dep_status,
        "message": "Todas as dependências essenciais estão instaladas" if all_deps_ok else "Algumas dependências estão ausentes",
    })

    # 5. Pre-trained weights existence
    weights_files = list(weights_dir.glob("*.pt")) if weights_dir.exists() else []
    weights_ok = len(weights_files) > 0
    checks.append({
        "id": "models",
        "name": "Pesos e Modelos YOLO",
        "status": "ok" if weights_ok else "error",
        "count": len(weights_files),
        "files": [f.name for f in weights_files],
        "message": f"{len(weights_files)} modelos YOLO encontrados prontos para uso" if weights_ok else "Nenhum modelo YOLO (.pt) encontrado",
    })

    return {
        "status": "ready" if (py_ok and weights_ok) else "attention",
        "checks": checks,
        "summary": {
            "gpuName": gpu_name,
            "cudaAvailable": cuda_available,
            "pythonVersion": py_version,
            "modelsCount": len(weights_files),
        }
    }

if __name__ == "__main__":
    result = check_environment()
    print(json.dumps(result, indent=2, ensure_ascii=False))
