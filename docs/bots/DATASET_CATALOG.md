# Catálogo Oficial de Datasets (DATASET_CATALOG.md)

> [!NOTE]
> Este arquivo cataloga todos os datasets de treinamento registrados no sistema.

---

## Datasets Homologados

### 1. `mm2-vision-dataset`
- **Jogo**: Roblox — Murder Mystery 2
- **Classes**: `coin`, `person`
- **Configuração**: `integrations/yolov5_mm2/vendor/data/mm2.yaml`
- **Origem**: `andrewwongwong/yolov5_mm2`
- **Formato**: YOLO Normalizado (.txt)
- **Finalidade**: Treinamento dos modelos oficiais do MM2 Coin Collector.

### 2. `hanami-spirits-dataset`
- **Jogo**: Roblox — Distrito de Hanami
- **Classes**: `0: urso_branco`, `1: urso_preto`
- **Configuração**: `datasets/hanami_spirits/data.yaml`
- **Origem**: Amostras e sprites autênticos extraídos das capturas do Distrito de Hanami (`datasets/hanami_spirits/`)
- **Amostras**: 323 imagens de treino + 67 de validação (390 total)
- **Augmentations**: 
  - Rotação contínua 360° (espíritos giratórios)
  - Variação multi-escala (perto: 140-380px, longe: 24-69px)
  - Desfoque direcional e gaussiano para compensar borrão à distância
- **Formato**: YOLO Normalizado (.txt)
- **Finalidade**: Treinamento do detector oficial `yolo11_hanami_spirits.pt`.
