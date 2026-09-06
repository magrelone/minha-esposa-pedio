# Estrutura e Gestão de Datasets (DATASETS.md)

Este documento define o formato padronizado de datasets para treino de detectores de visão na plataforma.

---

## 1. Estrutura de Diretórios Canônica

```
datasets/
└── [nome_do_jogo]/
    └── [nome_do_dataset]/
        ├── dataset.yaml
        ├── metadata.json
        ├── README.md
        ├── images/
        │   ├── train/
        │   ├── val/
        │   └── test/
        └── labels/
            ├── train/
            ├── val/
            └── test/
```

---

## 2. Divisão de Splits (Train / Val / Test)
A divisão padrão é realizada com sementes pseudoaleatórias fixas para reprodutibilidade:
- **Treino (`train`)**: 70% a 80% das amostras.
- **Validação (`val`)**: 15% a 20% das amostras.
- **Teste (`test`)**: 10% das amostras.

---

## 3. Formato do `dataset.yaml`
```yaml
train: datasets/roblox/mm2/images/train/
val: datasets/roblox/mm2/images/val/
test: datasets/roblox/mm2/images/test/

nc: 2
names: ['coin', 'person']
```
