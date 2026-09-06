import os
import sys
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional, List
from .types import TrainingProfile

class TrainingManager:
    PRESETS = {
        "fast_test": TrainingProfile(name="Fast Test", image_size=320, batch_size=16, epochs=5, workers=2),
        "balanced": TrainingProfile(name="Balanced", image_size=640, batch_size=12, epochs=100, workers=4),
        "full": TrainingProfile(name="Full Training", image_size=640, batch_size=12, epochs=500, workers=8),
    }

    def __init__(self, trainer_script_dir: Optional[str] = None):
        if trainer_script_dir is None:
            base = Path(__file__).resolve().parent.parent.parent
            trainer_script_dir = base / "integrations" / "yolov5_mm2" / "vendor"
        self.trainer_dir = Path(trainer_script_dir)

    def find_latest_checkpoint(self, project_dir: str = "runs/train") -> Optional[str]:
        p = Path(project_dir)
        if not p.exists():
            return None

        exp_dirs = [d for d in p.iterdir() if d.is_dir() and d.name.startswith("exp")]
        if not exp_dirs:
            return None

        def exp_key(d: Path):
            name = d.name.replace("exp", "")
            return int(name) if name.isdigit() else 1

        exp_dirs.sort(key=exp_key, reverse=True)
        latest_exp = exp_dirs[0]

        best_weights = latest_exp / "weights" / "best.pt"
        if best_weights.exists():
            return str(best_weights)

        last_weights = latest_exp / "weights" / "last.pt"
        if last_weights.exists():
            return str(last_weights)

        return None

    def build_training_command(self, data_yaml: str, profile: TrainingProfile, device: str = "auto") -> List[str]:
        cmd = [
            sys.executable,
            str(self.trainer_dir / "train.py"),
            "--img", str(profile.image_size),
            "--batch", str(profile.batch_size),
            "--epochs", str(profile.epochs),
            "--data", str(data_yaml),
            "--weights", str(profile.initial_weights),
            "--workers", str(profile.workers),
        ]
        if device != "auto":
            cmd.extend(["--device", device])
        return cmd
