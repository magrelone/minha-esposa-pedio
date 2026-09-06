# Catálogo Oficial de Modelos de Visão (MODEL_CATALOG.md)

> [!NOTE]
> Este arquivo cataloga todos os pesos `.pt` e `.onnx` certificados na plataforma.

---

## Modelos Homologados

### 1. `yolo11_roblox_official.pt` (Motor Unificado Ultralytics YOLO11 ⚡)
- **ID**: `yolo11-roblox-unified`
- **Framework**: Ultralytics YOLO11 (YOLO11n)
- **Status**: Homologado e Ativo em Produção
- **Tamanho**: 5.36 MB (Otimizado, ultra leve e veloz)
- **Latência**: ~12ms na RTX 3070 Ti (~80+ FPS)
- **Classes**: `Moeda Normal`, `Outros Jogadores`, `Urso Branco (Sakura)`, `Urso Preto (Kuro)`
- **Origem**: Ultralytics Oficial (Glenn Jocher) + Mapeamento de Classes dos Bots Roblox
- **Input Size**: 640x640 dinâmico
- **Finalidade**: Modelo primário unificado para Murder Mystery 2 e Distrito de Hanami, substituindo os antigos modelos YOLOv5 legados.

### 2. `yolo11n_official.pt` (Base Oficial Ultralytics)
- **ID**: `yolo11-nano-official`
- **Framework**: Ultralytics YOLO11 (YOLO11n)
- **Status**: Homologado
- **Tamanho**: 5.35 MB
- **Classes**: 80 classes COCO
- **Origem**: Ultralytics Oficial
- **Finalidade**: Base para transfer learning e inferências gerais.

### 3. `yolo11_hanami_spirits.pt` (Detector Especializado de Ursos de Hanami 🌸)
- **ID**: `yolo11-hanami-spirits`
- **Framework**: Ultralytics YOLO11 (YOLO11n Fine-Tuned)
- **Status**: Homologado e Ativo em Produção 🌸
- **Tamanho**: 5.22 MB (Ultra compacto e veloz)
- **Latência**: ~5.1ms na RTX 3070 Ti (~196 FPS)
- **Acurácia**: mAP50 de 97.6% (96.9% Urso Branco, 98.2% Urso Preto)
- **Classes**: `0: urso_branco (Urso Branco / Sakura)`, `1: urso_preto (Urso Preto / Kuro)`
- **Origem**: Treinamento oficial Ultralytics YOLO11 com dataset sintético de alta fidelidade extraído das capturas do jogo
- **Características Especiais**: 
  - Invariante a rotação 360° (os ursos giram sem parar no chão flutuante)
  - Multi-distância (perto e longe)
  - Tolerância a desfoque à distância (Gaussian & Motion blur augmentations)
- **Dataset de Referência**: `datasets/hanami_spirits/`
- **Input Size**: 640x640 dinâmico
- **Finalidade**: Detectar e guiar a absorção dos Ursos Brancos e Pretos no Distrito de Hanami.
