# Catálogo e Registro de Modelos (MODELS.md)

O `ModelRegistry` (`sdk.bot_sdk.models`) gerencia todos os pesos de redes neurais disponíveis na plataforma.

---

## 1. Metadados Obrigatórios de um Modelo
Cada modelo registrado deve possuir:
```json
{
  "id": "mm2-coin-v3",
  "name": "MM2 Coin Detector v3",
  "version": "3.0.0",
  "framework": "yolov5",
  "weights": "yolo_coin_m_v3.pt",
  "classes": ["coin"],
  "inputSize": 640,
  "game": "Roblox — Murder Mystery 2",
  "dataset": "mm2-coins",
  "sha256": "...",
  "license": "GPL-3.0 (yolov5) / Upstream",
  "description": "Detector treinado para localizar moedas douradas no MM2."
}
```

---

## 2. Descoberta Dinâmica de Modelos
Arquivos `.pt` ou `.onnx` colocados nas pastas de pesos são escaneados automaticamente, validando sua integridade antes da disponibilização na UI.
