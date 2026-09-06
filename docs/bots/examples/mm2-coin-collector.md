# Caso de Estudo Real: Roblox MM2 Coin Collector

Este exemplo documenta a integração real do robô de Murder Mystery 2 da plataforma.

---

## 1. Pipeline de Execução
```mermaid
graph TD
    Game["Roblox Window ('Murder Mystery 2')"] --> CaptureEngine
    CaptureEngine --> Frame["Frame (RGB 640x640)"]
    Frame --> VisionEngine["VisionEngine (LegacyYoloV5MM2Provider)"]
    Weights["yolo_coin_person_m_v2.pt"] --> VisionEngine
    VisionEngine --> Detections["Detection[] (coin: 94%, person: 88%)"]
    Detections --> MM2Strategy
    MM2Strategy --> ActionQueue["ActionQueue (flee_player or collect_coin)"]
    ActionQueue --> InputEngine["InputEngine (WASD / Jump)"]
```

---

## 2. Estratégia de Decisão
- Se `len(players) > 0`: calcula o centroide médio dos jogadores e caminha na direção oposta.
- Se `len(coins) > 0`: seleciona uma moeda detectada e aproxima o personagem usando vetores relativos de tela.
- Se nenhum objeto for detectado: dispara movimentos de busca aleatória para varrer a sala.
