import os
import sys
import time
from abc import ABC, abstractmethod
from typing import List, Tuple, Optional
from pathlib import Path
import numpy as np
from .types import Detection

class BaseVisionProvider(ABC):
    @abstractmethod
    def load(self, model_path: str, device: str = "auto") -> bool:
        pass

    @abstractmethod
    def infer(self, image_np: np.ndarray, conf_thres: float = 0.25, iou_thres: float = 0.45) -> List[Detection]:
        pass

    @abstractmethod
    def get_classes(self) -> List[str]:
        pass

class LegacyYoloV5MM2Provider(BaseVisionProvider):
    def __init__(self, yolov5_root: Optional[str] = None):
        self.model = None
        self.device = None
        self.class_names: List[str] = []
        self.torch = None

        if yolov5_root is None:
            # Default to bundled vendor yolov5
            base = Path(__file__).resolve().parent.parent.parent
            yolov5_root = base / "integrations" / "robloxbot" / "vendor" / "yolo" / "yolov5"

        if str(yolov5_root) not in sys.path:
            sys.path.insert(0, str(yolov5_root))

    def load(self, model_path: str, device: str = "auto") -> bool:
        import torch
        self.torch = torch

        dev_str = "cpu"
        if device in ["cuda", "auto"] and torch.cuda.is_available():
            dev_str = "cuda:0"
        self.device = torch.device(dev_str)

        # PyTorch 2.x+ safe load for older weights
        ckpt = torch.load(model_path, map_location=self.device, weights_only=False)
        self.model = ckpt["model"].float().fuse().eval()
        if dev_str.startswith("cuda"):
            self.model.half()

        names = getattr(self.model, "names", None)
        if isinstance(names, dict):
            self.class_names = [names[k] for k in sorted(names.keys())]
        elif isinstance(names, (list, tuple)):
            self.class_names = list(names)
        else:
            self.class_names = ["coin"]

        return True

    def infer(self, image_np: np.ndarray, conf_thres: float = 0.25, iou_thres: float = 0.45) -> List[Detection]:
        if self.model is None or self.torch is None:
            return []

        import cv2
        from utils.general import non_max_suppression, scale_coords

        h0, w0 = image_np.shape[:2]
        img_size = 640
        r = min(img_size / h0, img_size / w0)
        nw, nh = int(round(w0 * r)), int(round(h0 * r))
        dw, dh = (img_size - nw) % 32, (img_size - nh) % 32
        nw += dw
        nh += dh

        img_resized = cv2.resize(image_np, (nw, nh), interpolation=cv2.INTER_LINEAR)
        img_t = img_resized.transpose((2, 0, 1))[::-1]
        img_t = np.ascontiguousarray(img_t)

        tensor = self.torch.from_numpy(img_t).to(self.device)
        tensor = tensor.half() if self.device.type != "cpu" else tensor.float()
        tensor /= 255.0
        if tensor.ndimension() == 3:
            tensor = tensor.unsqueeze(0)

        with self.torch.no_grad():
            pred = self.model(tensor, augment=False)[0]
            detections = non_max_suppression(pred, conf_thres, iou_thres)

        results = []
        det = detections[0]
        if len(det):
            det[:, :4] = scale_coords(tensor.shape[2:], det[:, :4], image_np.shape).round()
            for *xyxy, conf, cls in det:
                x1, y1, x2, y2 = [float(x.item()) for x in xyxy]
                cid = int(cls.item())
                cname = self.class_names[cid] if cid < len(self.class_names) else f"class_{cid}"
                results.append(Detection(
                    class_id=cid,
                    class_name=cname,
                    confidence=round(float(conf.item()), 3),
                    bbox=(round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)),
                    rel_center=(round(((x1 + x2) / 2) / w0, 3), round(((y1 + y2) / 2) / h0, 3)),
                    width=round(x2 - x1, 1),
                    height=round(y2 - y1, 1)
                ))

        return results

    def get_classes(self) -> List[str]:
        return self.class_names

class ONNXProvider(BaseVisionProvider):
    def __init__(self):
        self.session = None
        self.class_names: List[str] = []

    def load(self, model_path: str, device: str = "auto") -> bool:
        # Prepared for future ONNX runtime integration
        try:
            import onnxruntime as ort
            providers = ['CUDAExecutionProvider', 'CPUExecutionProvider'] if device != "cpu" else ['CPUExecutionProvider']
            self.session = ort.InferenceSession(model_path, providers=providers)
            return True
        except Exception:
            return False

    def infer(self, image_np: np.ndarray, conf_thres: float = 0.25, iou_thres: float = 0.45) -> List[Detection]:
        # Placeholder for future onnx execution
        return []

    def get_classes(self) -> List[str]:
        return self.class_names

def enhance_for_blur_and_filters(
    image_np: np.ndarray,
    unsharp_strength: float = 1.2,
    clahe_clip: float = 2.0
) -> np.ndarray:
    """
    Pré-processamento de visão computacional projetado especificamente para jogos
    com cores saturadas, pós-processamento de luz (bloom/névoa) e desfoque de movimento:
    1. Equalização Adaptativa de Contraste (CLAHE) no canal Luminância do espaço LAB.
    2. Máscara de Nitidez (Unsharp Masking) para reconstruir bordas diluídas por filtros.
    """
    try:
        import cv2
        if image_np is None or image_np.size == 0:
            return image_np

        # Passo 1: Equalização de luminância em LAB (mantém fidelidade de matiz de cor)
        lab = cv2.cvtColor(image_np, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=clahe_clip, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        merged = cv2.merge((cl, a, b))
        balanced = cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)

        # Passo 2: Recuperação de contornos e nitidez contra motion blur
        if unsharp_strength > 0:
            blurred = cv2.GaussianBlur(balanced, (0, 0), sigmaX=3)
            sharpened = cv2.addWeighted(balanced, 1.0 + unsharp_strength, blurred, -unsharp_strength, 0)
            return sharpened

        return balanced
    except Exception:
        return image_np

class VisionEngine:
    def __init__(self, provider: Optional[BaseVisionProvider] = None):
        self.provider = provider or LegacyYoloV5MM2Provider()
        self.is_loaded = False
        self.last_inference_time = 0.0

    def load_model(self, model_path: str, device: str = "auto") -> bool:
        if model_path.endswith(".onnx"):
            self.provider = ONNXProvider()
        self.is_loaded = self.provider.load(model_path, device=device)
        return self.is_loaded

    def detect(
        self,
        image_np: np.ndarray,
        conf_thres: float = 0.25,
        iou_thres: float = 0.45,
        enhance_filters: bool = False
    ) -> List[Detection]:
        t0 = time.time()
        processed_img = enhance_for_blur_and_filters(image_np) if enhance_filters else image_np
        dets = self.provider.infer(processed_img, conf_thres=conf_thres, iou_thres=iou_thres)
        self.last_inference_time = time.time() - t0
        return dets

    def get_classes(self) -> List[str]:
        return self.provider.get_classes()

