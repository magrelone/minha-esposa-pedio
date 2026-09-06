# Especificação do Manifesto do Bot (BOT_MANIFEST.md)

Cada bot na plataforma é descrito por um arquivo canônico chamado `bot.json`.
Este arquivo reside na raiz da pasta do bot e deve satisfazer o schema [schemas/bot-manifest.schema.json](file:///c:/Projetos/Minha%20Esposa%20Pedio/schemas/bot-manifest.schema.json).

---

## Campos Obrigatórios

| Campo | Tipo | Descrição | Exemplo |
| :--- | :--- | :--- | :--- |
| `schemaVersion` | int | Versão do schema (atual: 1) | `1` |
| `id` | string | Identificador único em notação reversa | `"roblox.mm2.coin-collector"` |
| `name` | string | Nome legível exibido na UI | `"MM2 Coin Collector"` |
| `game` | string | Plataforma ou jogo principal | `"Roblox"` |
| `provider` | string | Fornecedor ou autor do bot | `"internal"` ou `"andrewwongwong/RobloxBot"` |
| `runtime` | string | Ambiente de execução | `"python"` |
| `capabilities` | string[] | Habilidades requeridas | `["screen_capture", "object_detection", "keyboard"]` |
| `entrypoint` | string | Arquivo principal executável | `"main.py"` |

---

## Campos Opcionais de Visão (`vision`)
- `provider`: Provedor do modelo (`"legacy-yolov5"` ou `"onnx"`).
- `models`: Lista de identificadores de modelos registrados no `ModelRegistry`.
- `defaultConfidence`: Limiar de confiança padrão recomendado (ex.: `0.25`).
