import os
import sys
import json
import time
from pathlib import Path

def scan_models(weights_dir=None):
    if weights_dir is None:
        base_dir = Path(__file__).resolve().parent
        weights_dir = base_dir / "vendor" / "bots" / "mm2_yolo_coin_collector" / "weights"

    weights_path = Path(weights_dir)
    models = []

    if not weights_path.exists():
        return models

    # Try importing torch safely
    torch = None
    try:
        import torch as t
        torch = t
    except Exception:
        pass

    for file_path in weights_path.glob("*.pt"):
        stat = file_path.stat()
        size_bytes = stat.st_size
        size_mb = round(size_bytes / (1024 * 1024), 2)
        mtime = time.strftime("%d/%m/%Y %H:%M", time.localtime(stat.st_mtime))

        classes = []
        status = "Pronto para uso"
        notes = ""

        # Default class knowledge for known models or dynamic extraction
        filename = file_path.name
        if "person" in filename.lower():
            classes = ["Moeda Normal", "Moeda Especial", "Outros Jogadores"]
            notes = "Evita jogadores e coleta moedas"
        elif "coin" in filename.lower():
            classes = ["Moeda Normal"]
            notes = "Coleta moedas padrão"

        # Attempt dynamic class extraction if torch is available
        if torch is not None:
            try:
                # Add safe globals or use weights_only=False
                ckpt = torch.load(str(file_path), map_location="cpu", weights_only=False)
                if isinstance(ckpt, dict) and "model" in ckpt:
                    model_obj = ckpt["model"]
                    names = getattr(model_obj, "names", None)
                    if names is not None:
                        if isinstance(names, dict):
                            classes = list(names.values())
                        elif isinstance(names, (list, tuple)):
                            classes = list(names)
            except Exception as e:
                # We still keep the model but note load check
                pass

        models.append({
            "id": filename,
            "filename": filename,
            "path": str(file_path),
            "sizeBytes": size_bytes,
            "sizeFormatted": f"{size_mb} MB",
            "provider": "andrewwongwong/RobloxBot",
            "classes": classes if classes else ["Moedas MM2"],
            "dateDiscovered": mtime,
            "deviceSupport": "CUDA / CPU",
            "status": status,
            "notes": notes,
        })

    return models

if __name__ == "__main__":
    result = scan_models()
    print(json.dumps(result, indent=2, ensure_ascii=False))
