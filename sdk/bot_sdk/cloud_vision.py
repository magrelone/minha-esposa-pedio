"""
Cloud Vision & Grounding Module (cloud_vision.py)
------------------------------------------------
Integração com IA em nuvem de alta capacidade e plano gratuito generoso (Google Gemini 2.0 Flash:
15 RPM / 1.500 requisições diárias gratuitas) para:
1. Auto-Anotação de Datasets: Converte prints de jogos com filtros e blur em rótulos YOLO sem esforço manual.
2. Oráculo Visual Assíncrono: Auxilia o bot local quando a confiança de detecção cai abaixo do limiar.
3. Controle Rígido de Cota: Limite inviolável de 1.500 requisições por dia para garantir gasto ZERO (100% Gratuito).
"""

import os
import json
import base64
import time
from datetime import datetime
from pathlib import Path
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional

class GeminiCloudVision:
    """
    Cliente nativo HTTP sem dependências pesadas para o Google Gemini Flash API.
    Utiliza a camada gratuita oficial (1.500 requisições/dia).
    Controla o gasto e persiste o histórico localmente.
    """

    DEFAULT_MODEL = "gemini-2.0-flash"
    DAILY_LIMIT = 1500
    API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = DEFAULT_MODEL,
        usage_file: Optional[str] = None
    ):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY", "")
        self.model = model

        # Local de persistência de gastos e cotas
        if usage_file:
            self.usage_file = Path(usage_file)
        else:
            base_dir = Path(__file__).resolve().parent.parent.parent
            self.usage_file = base_dir / "runtime" / "gemini_usage.json"
        
        self._ensure_usage_dir()

    def _ensure_usage_dir(self):
        try:
            self.usage_file.parent.mkdir(parents=True, exist_ok=True)
        except Exception:
            pass

    def set_api_key(self, key: str):
        self.api_key = key.strip()

    def get_quota_status(self) -> Dict[str, Any]:
        """
        Retorna o status atual de consumo da cota gratuita diária de 1.500 requisições.
        """
        today_str = datetime.now().strftime("%Y-%m-%d")
        data = self._read_usage_data()

        if data.get("current_date") != today_str:
            # Novo dia: renova a cota diária automaticamente
            data["current_date"] = today_str
            data["requests_today"] = 0
            self._write_usage_data(data)

        requests_today = data.get("requests_today", 0)
        remaining = max(0, self.DAILY_LIMIT - requests_today)
        percent_used = round((requests_today / self.DAILY_LIMIT) * 100, 1)

        return {
            "date": today_str,
            "requests_today": requests_today,
            "daily_limit": self.DAILY_LIMIT,
            "remaining_today": remaining,
            "percent_used": percent_used,
            "is_quota_exceeded": requests_today >= self.DAILY_LIMIT,
            "estimated_cost_usd": 0.00,
            "estimated_cost_brl": 0.00,
            "pricing_tier": "Free Tier (Google AI Studio - 100% Gratuito)",
            "lifetime_requests": data.get("lifetime_requests", 0),
            "last_request": data.get("last_request"),
        }

    def _read_usage_data(self) -> Dict[str, Any]:
        today_str = datetime.now().strftime("%Y-%m-%d")
        default_data = {
            "current_date": today_str,
            "requests_today": 0,
            "lifetime_requests": 0,
            "last_request": None,
            "daily_history": {}
        }

        if not self.usage_file.exists():
            return default_data

        try:
            with open(self.usage_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return default_data

    def _write_usage_data(self, data: Dict[str, Any]):
        try:
            self._ensure_usage_dir()
            with open(self.usage_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[GeminiCloudVision] Erro ao salvar cota em disco: {e}")

    def _increment_usage(self):
        today_str = datetime.now().strftime("%Y-%m-%d")
        data = self._read_usage_data()

        if data.get("current_date") != today_str:
            data["current_date"] = today_str
            data["requests_today"] = 0

        data["requests_today"] = data.get("requests_today", 0) + 1
        data["lifetime_requests"] = data.get("lifetime_requests", 0) + 1
        data["last_request"] = datetime.now().isoformat()

        # Histórico por dia
        if "daily_history" not in data:
            data["daily_history"] = {}
        data["daily_history"][today_str] = data["requests_today"]

        self._write_usage_data(data)

    def detect_items_in_frame(
        self,
        image_bytes: bytes,
        target_description: str = "moedas, caixas ou itens colecionáveis do jogo",
        class_name: str = "item"
    ) -> List[Dict[str, Any]]:
        """
        Solicita ao Gemini 2.0 Flash as coordenadas normalizadas (Bounding Boxes) dos itens visíveis.
        Verifica estritamente a cota diária de 1.500 requisições antes de enviar.
        """
        if not self.api_key:
            print("[GeminiCloudVision] Nenhuma API Key configurada.")
            return []

        quota = self.get_quota_status()
        if quota["is_quota_exceeded"]:
            print(f"[GeminiCloudVision] LIMITE DIÁRIO ATINGIDO: {quota['requests_today']}/1500 requisições hoje. Requisição abortada para manter custo ZERO.")
            return []

        b64_img = base64.b64encode(image_bytes).decode("utf-8")

        prompt = f"""
Você é um especialista em visão computacional para automação de jogos.
Analise esta imagem de jogo (que pode conter filtros visuais, névoa, desfoque de movimento ou cores saturadas).
Detecte com precisão a localização de todos os: {target_description}.
Para cada objeto detectado, forneça o bounding box em coordenadas normalizadas de 0 a 1000 no formato [ymin, xmin, ymax, xmax].

Responda ESTRITAMENTE em formato JSON com a seguinte estrutura:
{{
  "detections": [
    {{
      "box_2d": [ymin, xmin, ymax, xmax],
      "label": "{class_name}",
      "confidence": 0.95
    }}
  ]
}}
"""

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": b64_img
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "response_mime_type": "application/json"
            }
        }

        url = self.API_URL.format(model=self.model, api_key=self.api_key)
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=12) as response:
                res_body = response.read().decode("utf-8")
                res_json = json.loads(res_body)
                text_out = res_json["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text_out)
                
                # Consumo confirmado com sucesso
                self._increment_usage()
                return parsed.get("detections", [])
        except Exception as e:
            print(f"[GeminiCloudVision] Erro na requisição: {e}")
            return []

    def convert_to_yolo_format(
        self,
        gemini_detections: List[Dict[str, Any]],
        class_id: int = 0
    ) -> List[str]:
        """
        Converte as bounding boxes do Gemini [ymin, xmin, ymax, xmax] (0..1000)
        para o formato padrão de anotação YOLO:
        <class_id> <x_center> <y_center> <width> <height> (0.0 a 1.0)
        """
        yolo_lines = []
        for det in gemini_detections:
            box = det.get("box_2d", [])
            if len(box) == 4:
                ymin, xmin, ymax, xmax = [v / 1000.0 for v in box]
                x_center = (xmin + xmax) / 2.0
                y_center = (ymin + ymax) / 2.0
                width = max(0.001, xmax - xmin)
                height = max(0.001, ymax - ymin)

                yolo_lines.append(
                    f"{class_id} {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}"
                )
        return yolo_lines
