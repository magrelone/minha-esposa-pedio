# Motor de Visão Computacional (VISION_ENGINE.md)

O `VisionEngine` (`sdk.bot_sdk.vision`) é o componente central que abstrai o carregamento e inferência de redes neurais convolucionais e detectores de objetos.

---

## 1. Interface Unificada

```python
class VisionEngine:
    def load_model(self, model_id_or_path: str, device: str = "auto") -> bool:
        ...
    def detect(self, image_np: np.ndarray, conf_thres: float = 0.25, iou_thres: float = 0.45) -> List[Detection]:
        ...
    def get_classes(self) -> List[str]:
        ...
    def get_stats(self) -> VisionStats:
        ...
```

---

## 2. Provedores de Visão

### `LegacyYoloV5MM2Provider`
- Desenvolvido especificamente para carregar os pesos pré-treinados do fork `yolov5_mm2` e `RobloxBot`.
- Corrige incompatibilidades do PyTorch 2.6+ onde checkpoints mais antigos exigem `weights_only=False`.
- Suporta aceleração por GPU (FP16 via CUDA) e CPU fallback (FP32).

### `ONNXProvider`
- Projetado para carregar modelos convertidos em formato `.onnx`.
- Proporciona inferência rápida via ONNX Runtime com uso reduzido de memória.

---

## 3. Pré-Processamento para Jogos com Filtros, Cores Saturadas e Desfoque
Em jogos modernos estilizados com filtros intensos de iluminação (bloom, névoa colorida, saturação alta) e desfoque de movimento (*motion blur*), a detecção clássica pode degradar.
O `VisionEngine` conta com a função `enhance_for_blur_and_filters`:
- **CLAHE (Equalização Adaptativa de Contraste)**: Aplicada exclusivamente no canal Luminância ($L$) do espaço de cor $LAB$. Normaliza zonas superexpostas e escuras sem alterar a matiz cromática do jogo.
- **Unsharp Masking (Máscara de Nitidez Inversa)**: Filtro convolucional que recupera as bordas e silhuetas dos objetos diluídas pelo motion blur.
- Ativação direta: `engine.detect(frame, enhance_filters=True)`.

---

## 4. IA em Nuvem Gratuita: Google Gemini 2.0 Flash (`cloud_vision.py`)
Para criar modelos com precisão cirúrgica sem trabalho manual de anotação de milhares de imagens, o módulo `GeminiCloudVision` (`sdk.bot_sdk.cloud_vision`) integra a camada gratuita oficial da Google Cloud (1.500 requisições diárias):
1. **Auto-Anotador de Dataset**: Envia prints do jogo capturados em momentos desafiadores (com filtros e blur) e recebe bounding boxes semânticas, gerando arquivos `.txt` no formato YOLO automaticamente.
2. **Oráculo Assíncrono**: Atua como fallback quando a confiança do modelo local em 60 FPS cair, reorientando o bot para a coordenada correta.

