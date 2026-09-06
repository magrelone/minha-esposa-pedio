# Treinamento YOLOv5 com yolov5_mm2 (YOLO_TRAINING.md)

Este documento documenta o pipeline de treinamento para novos detectores de objetos utilizando como base o fork `yolov5_mm2`.

---

## 1. Fluxo de Treinamento Original

Conforme estabelecido no README do `yolov5_mm2`:
1. Estruturar imagens e anotações em pastas `train` e `test` (ou `val`).
2. Criar ou referenciar o arquivo YAML do dataset (ex.: `data/mm2.yaml`).
3. Executar o comando de treinamento:
   ```bash
   python train.py --img 640 --batch 12 --epochs 500 --data data/mm2.yaml --weights yolov5m.pt
   ```
4. Os pesos finais são gravados automaticamente em:
   ```
   runs/train/exp#/weights/best.pt
   runs/train/exp#/weights/last.pt
   ```

---

## 2. Perfis de Treinamento (`TrainingProfile`)

Para que o usuário ou a IA não precisem definir hiperparâmetros soltos, o SDK disponibiliza os seguintes perfis:

| Perfil | Epochs | Batch Size | Img Size | Finalidade |
| :--- | :--- | :--- | :--- | :--- |
| **Fast Test** | 5 | 16 | 320 | Teste de validação rápida do pipeline |
| **Balanced** | 100 | 12 | 640 | Treinamento padrão equilibrado |
| **Full Training** | 500 | 12 | 640 | Treinamento de alta precisão (configuração do MM2) |
| **Custom** | Ajustável | Ajustável | Ajustável | Configuração manual |

---

## 3. Localização Dinâmica de Checkpoints
O `TrainingManager` escaneia o diretório `runs/train/` e detecta o diretório de maior numeração (`exp`, `exp2`, `exp3`, etc.) para extrair os pesos `best.pt` gerados.
