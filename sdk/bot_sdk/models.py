import os
import hashlib
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, field

@dataclass
class ModelMetadata:
    id: str
    name: str
    version: str
    framework: str
    weights_path: str
    classes: List[str]
    input_size: int
    game: str
    sha256: str
    license: str
    description: str

class ModelRegistry:
    def __init__(self, weights_dir: Optional[str] = None):
        if weights_dir is None:
            base = Path(__file__).resolve().parent.parent.parent
            weights_dir = base / "integrations" / "robloxbot" / "vendor" / "bots" / "mm2_yolo_coin_collector" / "weights"
        self.weights_dir = Path(weights_dir)
        self.models: Dict[str, ModelMetadata] = {}
        self._discover()

    def _compute_sha256(self, filepath: Path) -> str:
        h = hashlib.sha256()
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                h.update(chunk)
        return h.hexdigest()

    def _discover(self):
        if not self.weights_dir.exists():
            return

        for p in self.weights_dir.glob("*.pt"):
            fname = p.name
            classes = ["coin"]
            desc = "Detector de moedas MM2"
            if "person" in fname.lower():
                classes = ["coin", "person"]
                desc = "Detector de moedas e jogadores MM2"

            sha = self._compute_sha256(p)
            mid = fname.replace(".pt", "")
            self.models[mid] = ModelMetadata(
                id=mid,
                name=fname,
                version="1.0.0",
                framework="yolov5",
                weights_path=str(p),
                classes=classes,
                input_size=640,
                game="Roblox — Murder Mystery 2",
                sha256=sha,
                license="GPL-3.0 / Upstream",
                description=desc
            )

    def get_model(self, model_id: str) -> Optional[ModelMetadata]:
        return self.models.get(model_id)

    def get_models_by_class(self, class_name: str) -> List[ModelMetadata]:
        return [m for m in self.models.values() if class_name.lower() in [c.lower() for c in m.classes]]

    def list_models(self) -> List[ModelMetadata]:
        return list(self.models.values())
