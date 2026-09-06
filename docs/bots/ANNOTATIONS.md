# Formato de Anotações & Validação (ANNOTATIONS.md)

As anotações seguem estritamente o formato padrão YOLO (arquivos `.txt` associados a cada imagem de mesmo nome).

---

## 1. Formato da Linha YOLO
Cada linha do arquivo `.txt` representa uma bounding box:
```
<class_id> <center_x> <center_y> <width> <height>
```
Todos os valores de coordenadas são **normalizados entre 0.0 e 1.0**:
- `class_id`: Índice inteiro da classe (iniciando em 0).
- `center_x`: Posição horizontal do centro da caixa dividida pela largura da imagem.
- `center_y`: Posição vertical do centro da caixa dividida pela altura da imagem.
- `width`: Largura da caixa dividida pela largura da imagem.
- `height`: Altura da caixa dividida pela altura da imagem.

---

## 2. Validações Automáticas Realizadas pelo SDK
O `DatasetInspector` valida:
1. Valores fora do intervalo `[0.0, 1.0]`.
2. Dimensões negativas ou nulas.
3. Classes inexistentes (maiores ou iguais a `nc`).
4. Imagens sem anotação correspondente.
5. Arquivos `.txt` sem imagem correspondente.
6. Imagens duplicadas via perceptual hash.
