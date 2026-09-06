# Arquitetura do Bot SDK & Vision SDK (ARCHITECTURE.md)

Este documento descreve a arquitetura desacoplada que permite criar bots e modelos reutilizáveis sem duplicação de código.

---

## 1. Visão Geral em Camadas

```
+-------------------------------------------------------------------------+
|                         Interface do Usuário (UI)                       |
|           React / Vite / Tailwind / Tauri Frontend (Desktop)            |
|       (Central de Bots, Preview de Visão, Console de Logs, Treino)      |
+-------------------------------------------------------------------------+
                                    | IPC (JSON Lines / Tauri Events)
                                    v
+-------------------------------------------------------------------------+
|                       Tauri Native Host (Rust)                          |
|         Process Manager (bot_manager.rs), Event Bridge, Lifecycle       |
+-------------------------------------------------------------------------+
                                    | Subprocess Pipe (stdin/stdout)
                                    v
+-------------------------------------------------------------------------+
|                             Bot SDK Runtime                             |
|                                                                         |
|   +-------------------+    +-------------------+    +---------------+   |
|   |   CaptureEngine   |--->|    VisionEngine   |--->| DecisionEngine|   |
|   | (Screen/ROI/DPI)  |    | (LegacyYOLO/ONNX) |    |  (Strategy)   |   |
|   +-------------------+    +-------------------+    +---------------+   |
|                                                             |           |
|                                                             v           |
|   +-------------------+    +-------------------+    +---------------+   |
|   |   Failsafe / State|    |    InputEngine    |<---|  ActionQueue  |   |
|   |      Machine      |    | (Keyboard/Mouse)  |    | (Priorities)  |   |
|   +-------------------+    +-------------------+    +---------------+   |
|                                                                         |
|   +-------------------+    +-------------------+    +---------------+   |
|   |   ModelRegistry   |    |  DatasetRegistry  |    |TrainingManager|   |
|   +-------------------+    +-------------------+    +---------------+   |
+-------------------------------------------------------------------------+
```

---

## 2. Componentes Centrais

### 1. `CaptureEngine` (`sdk.bot_sdk.capture`)
- Responsável pela obtenção de quadros de vídeo a partir de monitores, janelas ou regiões retangulares selecionadas pelo usuário.
- Trata escala de DPI do Windows automaticamente para evitar desalinhamento de coordenadas.
- Fornece quadros no formato padronizado `Frame`.

### 2. `VisionEngine` (`sdk.bot_sdk.vision`)
- Abstração multi-provedor:
  - `LegacyYoloV5MM2Provider`: Garante suporte aos modelos antigos do repositório `andrewwongwong/RobloxBot` e `yolov5_mm2` sem erros de deserialização no PyTorch 2.x+.
  - `ONNXProvider`: Suporte a exportações de alta velocidade em ONNX Runtime.
- Converte previsões brutas em uma lista de estruturas `Detection`.

### 3. `Detection` (Estrutura Normalizada)
```python
@dataclass
class Detection:
    class_id: int
    class_name: str
    confidence: float
    bbox: Tuple[float, float, float, float]  # [x1, y1, x2, y2]
    rel_center: Tuple[float, float]          # [cx, cy] normalizado (0.0 a 1.0)
    width: float
    height: float
```

### 4. `DecisionEngine` & `Strategy` (`sdk.bot_sdk.decision`)
- O bot não toma decisões dentro do loop de captura. Ele implementa uma classe que herda de `BotStrategy`.
- Recebe a lista de `Detection` e o estado atual do bot, retornando uma lista de objetos `Action`.

### 5. `InputEngine` & `ActionQueue` (`sdk.bot_sdk.input`)
- Recebe ações padronizadas (`MOVE_FORWARD`, `MOVE_LEFT`, `JUMP`, etc.) e as despacha de forma segura.
- Oferece modo de simulação (`simulation_mode=True`) onde nenhum clique real ou tecla é emitida.
- Libera automaticamente todas as teclas caso o processo seja interrompido abruptamente (`release_all_keys`).
