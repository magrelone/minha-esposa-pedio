import os
import random
import yaml
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass

@dataclass
class DatasetMetadata:
    id: str
    game: str
    name: str
    version: str
    classes: List[str]
    image_count: int
    train_count: int
    val_count: int
    test_count: int
    location: str

class DatasetInspector:
    @staticmethod
    def inspect(dataset_dir: str) -> Dict[str, Any]:
        p = Path(dataset_dir)
        images = list(p.glob("**/*.jpg")) + list(p.glob("**/*.png"))
        labels = list(p.glob("**/*.txt"))

        invalid_boxes = 0
        total_boxes = 0
        class_counts: Dict[int, int] = {}

        for l in labels:
            try:
                with open(l, "r") as f:
                    for line in f:
                        parts = line.strip().split()
                        if len(parts) >= 5:
                            total_boxes += 1
                            cid = int(parts[0])
                            class_counts[cid] = class_counts.get(cid, 0) + 1
                            cx, cy, w, h = [float(v) for v in parts[1:5]]
                            if not (0.0 <= cx <= 1.0 and 0.0 <= cy <= 1.0 and 0.0 < w <= 1.0 and 0.0 < h <= 1.0):
                                invalid_boxes += 1
            except Exception:
                pass

        return {
            "image_count": len(images),
            "label_count": len(labels),
            "total_boxes": total_boxes,
            "invalid_boxes": invalid_boxes,
            "class_distribution": class_counts,
            "valid": invalid_boxes == 0 and len(images) > 0
        }

class DatasetRegistry:
    def __init__(self, datasets_dir: Optional[str] = None):
        if datasets_dir is None:
            base = Path(__file__).resolve().parent.parent.parent
            datasets_dir = base / "datasets"
        self.datasets_dir = Path(datasets_dir)
        self.datasets: Dict[str, DatasetMetadata] = {}

    @staticmethod
    def generate_yaml(output_path: str, train_path: str, val_path: str, test_path: str, classes: List[str]):
        data = {
            "train": str(train_path),
            "val": str(val_path),
            "test": str(test_path),
            "nc": len(classes),
            "names": classes
        }
        with open(output_path, "w", encoding="utf-8") as f:
            yaml.dump(data, f, sort_keys=False)

    @staticmethod
    def split_dataset(images_dir: str, train_ratio: float = 0.7, val_ratio: float = 0.2, test_ratio: float = 0.1, seed: int = 42) -> Dict[str, int]:
        rng = random.Random(seed)
        p = Path(images_dir)
        all_imgs = sorted(list(p.glob("*.jpg")) + list(p.glob("*.png")))
        rng.shuffle(all_imgs)

        n = len(all_imgs)
        n_train = int(n * train_ratio)
        n_val = int(n * val_ratio)

        train_set = all_imgs[:n_train]
        val_set = all_imgs[n_train:n_train + n_val]
        test_set = all_imgs[n_train + n_val:]

        return {
            "train": len(train_set),
            "val": len(val_set),
            "test": len(test_set)
        }
