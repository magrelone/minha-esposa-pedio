import os
import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import shutil
from pathlib import Path
import torch
from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_YAML = BASE_DIR / "datasets" / "hanami_spirits" / "data.yaml"
BASE_WEIGHTS = BASE_DIR / "integrations" / "robloxbot" / "vendor" / "bots" / "mm2_yolo_coin_collector" / "weights" / "yolo11n_official.pt"
OUTPUT_DIR = BASE_DIR / "runs" / "train_hanami"
TARGET_WEIGHTS = BASE_DIR / "integrations" / "robloxbot" / "vendor" / "bots" / "mm2_yolo_coin_collector" / "weights" / "yolo11_hanami_spirits.pt"

def train():
    print(f"🚀 Iniciando Treinamento YOLO11 Oficial para Espíritos de Hanami...")
    print(f"  CUDA disponível: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"  Dispositivo GPU: {torch.cuda.get_device_name(0)}")
        device = 0
    else:
        device = "cpu"

    if not BASE_WEIGHTS.exists():
        print(f"⚠️ Base weights não encontrada em {BASE_WEIGHTS}, baixando yolo11n.pt oficial...")
        model = YOLO("yolo11n.pt")
    else:
        print(f"📦 Carregando modelo base: {BASE_WEIGHTS}")
        model = YOLO(str(BASE_WEIGHTS))

    results = model.train(
        data=str(DATA_YAML),
        epochs=20,
        imgsz=640,
        batch=16,
        device=device,
        project=str(OUTPUT_DIR),
        name="hanami_yolo11",
        exist_ok=True,
        workers=2,
        degrees=180.0, # Data augmentation de rotação total no YOLO
        scale=0.5,     # Escala de longe/perto
        fliplr=0.5,    # Espelhamento horizontal
        verbose=True
    )

    best_pt = OUTPUT_DIR / "hanami_yolo11" / "weights" / "best.pt"
    if best_pt.exists():
        shutil.copy(str(best_pt), str(TARGET_WEIGHTS))
        print(f"🎉 Modelo YOLO11 Treinado e Salvo com Sucesso!")
        print(f"  Destino Oficial: {TARGET_WEIGHTS} ({TARGET_WEIGHTS.stat().st_size / (1024*1024):.2f} MB)")
    else:
        last_pt = OUTPUT_DIR / "hanami_yolo11" / "weights" / "last.pt"
        if last_pt.exists():
            shutil.copy(str(last_pt), str(TARGET_WEIGHTS))
            print(f"🎉 Modelo YOLO11 Treinado (last.pt) e Salvo com Sucesso!")
            print(f"  Destino Oficial: {TARGET_WEIGHTS}")
        else:
            print("❌ Erro: Pesos gerados não foram encontrados.")

if __name__ == "__main__":
    train()
