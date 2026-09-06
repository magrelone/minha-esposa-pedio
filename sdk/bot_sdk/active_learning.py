"""
Active Learning & Continuous Online Vision Module (active_learning.py)
----------------------------------------------------------------------
Permite que o bot continue aprendendo em tempo real enquanto joga:
1. Analisa frames de dúvida (baixa confiança) ou frames periódicos do jogo.
2. Consulta o Google Gemini 2.0 Flash em segundo plano (sem travar o jogo).
3. Auto-anota o par de imagem e rótulo YOLO em `runtime/active_learning_dataset/`.
4. Auxilia o bot imediatamente (oráculo visual) se o modelo local não vir nada.
5. Respeita a cota gratuita oficial de 1.500 requisições diárias da Google Cloud.
"""

import os
import time
import queue
import threading
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple
import numpy as np

from .cloud_vision import GeminiCloudVision


class ActiveLearningManager:
    def __init__(
        self,
        api_key: Optional[str] = None,
        dataset_dir: Optional[str] = None,
        min_interval_seconds: float = 12.0,
        low_confidence_threshold: float = 0.35,
        target_description: str = "moedas, caixas, espíritos ou itens colecionáveis",
        class_name: str = "item",
    ):
        self.cloud_vision = GeminiCloudVision(api_key=api_key)
        self.min_interval = min_interval_seconds
        self.low_conf_thresh = low_confidence_threshold
        self.target_description = target_description
        self.class_name = class_name

        self.last_query_time = 0.0
        self.is_enabled = True
        self.samples_collected = 0

        # Diretório do dataset vivo de aprendizado contínuo
        base_dir = Path(__file__).resolve().parent.parent.parent
        if dataset_dir:
            self.dataset_dir = Path(dataset_dir)
        else:
            self.dataset_dir = base_dir / "runtime" / "active_learning_dataset"

        self.images_dir = self.dataset_dir / "images"
        self.labels_dir = self.dataset_dir / "labels"
        self._ensure_dataset_dirs()

        # Fila de processamento assíncrono para nunca bloquear o loop de 60 FPS
        self._frame_queue = queue.Queue(maxsize=3)
        self._worker_thread: Optional[threading.Thread] = None
        self._running = False
        self._emit_callback = None
        self._oracle_detections: List[Dict[str, Any]] = []
        self._oracle_lock = threading.Lock()

    def _ensure_dataset_dirs(self):
        try:
            self.images_dir.mkdir(parents=True, exist_ok=True)
            self.labels_dir.mkdir(parents=True, exist_ok=True)
            # Contar amostras pré-existentes
            existing = list(self.images_dir.glob("*.jpg"))
            self.samples_collected = len(existing)
        except Exception:
            pass

    def set_emit_callback(self, callback):
        self._emit_callback = callback

    def set_api_key(self, api_key: str):
        self.cloud_vision.set_api_key(api_key)

    def start(self):
        if self._running:
            return
        self._running = True
        self._worker_thread = threading.Thread(
            target=self._background_learning_worker, daemon=True, name="GeminiActiveLearningWorker"
        )
        self._worker_thread.start()

    def stop(self):
        self._running = False
        if self._worker_thread and self._worker_thread.is_alive():
            try:
                self._worker_thread.join(timeout=1.0)
            except Exception:
                pass

    def should_sample(self, local_detections: List[Any], force: bool = False) -> bool:
        """
        Determina se o frame atual é um candidato valioso para aprendizado ativo:
        1. Se o intervalo mínimo de tempo foi respeitado.
        2. Se a detecção local teve baixa confiança (dúvida do YOLO).
        3. Ou se nenhuma detecção foi feita há algum tempo (procura ativa do Gemini).
        """
        if not self.is_enabled:
            return False

        now = time.time()
        if not force and (now - self.last_query_time < self.min_interval):
            return False

        # Verifica baixa confiança nas detecções locais
        has_low_conf = False
        if local_detections:
            for det in local_detections:
                conf = getattr(det, "confidence", None)
                if conf is None and isinstance(det, dict):
                    conf = det.get("confidence", 1.0)
                if conf and conf < self.low_conf_thresh:
                    has_low_conf = True
                    break

        is_empty = len(local_detections) == 0
        is_periodic = (now - self.last_query_time) >= (self.min_interval * 2.0)

        return force or has_low_conf or (is_empty and is_periodic)

    def submit_frame_for_learning(self, image_np: np.ndarray, reason: str = "periodic"):
        """
        Envia o frame para a fila de aprendizado assíncrono em background.
        Nunca trava a renderização ou a velocidade de captura do bot.
        """
        if not self.is_enabled or not self._running:
            return

        now = time.time()
        self.last_query_time = now

        # Evita enfileirar se o worker já estiver ocupado processando
        if self._frame_queue.full():
            try:
                self._frame_queue.get_nowait()
            except queue.Empty:
                pass

        try:
            self._frame_queue.put_nowait((image_np.copy(), reason, now))
        except queue.Full:
            pass

    def get_latest_oracle_detections(self) -> List[Dict[str, Any]]:
        """
        Retorna as últimas detecções geradas pelo Gemini para auxiliar o bot.
        """
        with self._oracle_lock:
            dets = list(self._oracle_detections)
            self._oracle_detections.clear()
            return dets

    def _background_learning_worker(self):
        """
        Loop em background: processa os frames selecionados com a IA Gemini.
        """
        import cv2

        while self._running:
            try:
                item = self._frame_queue.get(timeout=1.0)
            except queue.Empty:
                continue

            frame_np, reason, timestamp = item

            try:
                # Codifica o frame em JPEG otimizado
                success, buffer = cv2.imencode(".jpg", frame_np, [cv2.IMWRITE_JPEG_QUALITY, 85])
                if not success:
                    continue

                image_bytes = buffer.tobytes()

                # Chama a API do Gemini 2.0 Flash com controle de cota
                detections = self.cloud_vision.detect_items_in_frame(
                    image_bytes=image_bytes,
                    target_description=self.target_description,
                    class_name=self.class_name,
                )

                if detections:
                    # 1. Salvar imagem e anotação YOLO
                    sample_id = f"active_sample_{int(timestamp)}_{self.samples_collected + 1}"
                    img_path = self.images_dir / f"{sample_id}.jpg"
                    lbl_path = self.labels_dir / f"{sample_id}.txt"

                    # Gravar JPEG
                    with open(img_path, "wb") as f:
                        f.write(image_bytes)

                    # Gravar Labels YOLO
                    yolo_lines = self.cloud_vision.convert_to_yolo_format(detections, class_id=0)
                    with open(lbl_path, "w", encoding="utf-8") as f:
                        f.write("\n".join(yolo_lines) + "\n")

                    self.samples_collected += 1

                    # 2. Atualizar oráculo visual para o bot utilizar
                    h0, w0 = frame_np.shape[:2]
                    formatted_oracle = []
                    for d in detections:
                        box = d.get("box_2d", [])
                        if len(box) == 4:
                            ymin, xmin, ymax, xmax = [v / 1000.0 for v in box]
                            x1, y1 = round(xmin * w0, 1), round(ymin * h0, 1)
                            x2, y2 = round(xmax * w0, 1), round(ymax * h0, 1)
                            formatted_oracle.append({
                                "class_id": 0,
                                "class_name": d.get("label", self.class_name),
                                "confidence": d.get("confidence", 0.95),
                                "bbox": (x1, y1, x2, y2),
                                "rel_center": (round((xmin + xmax) / 2, 3), round((ymin + ymax) / 2, 3)),
                                "source": "gemini_active_learning"
                            })

                    with self._oracle_lock:
                        self._oracle_detections = formatted_oracle

                    # 3. Emitir telemetria para o frontend
                    quota = self.cloud_vision.get_quota_status()
                    if self._emit_callback:
                        self._emit_callback(
                            "active_learning_sample",
                            sample_id=sample_id,
                            samples_collected=self.samples_collected,
                            detections_count=len(detections),
                            reason=reason,
                            quota=quota,
                            message=f"🧠 Gemini auto-anotou {len(detections)} objeto(s) ao vivo no jogo! Total: {self.samples_collected} amostras",
                        )

            except Exception as e:
                # Silencioso para manter estabilidade
                pass
