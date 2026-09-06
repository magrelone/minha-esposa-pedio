# Aceleração por GPU & Suporte de Hardware (GPU.md)

Este documento descreve como o Bot SDK detecta e utiliza placas de vídeo dedicadas.

---

## 1. Detecção Automática
O sistema identifica:
1. Placa de vídeo instalada via `nvidia-smi` ou WMI (ex.: `NVIDIA GeForce RTX 3070 Ti`).
2. Disponibilidade do runtime CUDA no PyTorch via `torch.cuda.is_available()`.
3. Modo CPU Fallback automático caso os drivers CUDA não estejam presentes no ambiente virtual.

---

## 2. Requisitos de VRAM
- **Inferência FP16**: Aproximadamente 1.2 GB de VRAM alocada.
- **Treinamento com Batch 12 (YOLOv5m)**: Mínimo recomendado de 6 GB a 8 GB de VRAM.
