# Instruções Críticas para Agentes de IA & Coding Agents (AGENTS.md)

> [!IMPORTANT]
> **LEIA ISTO ANTES DE CRIAR OU MODIFICAR QUALQUER BOT OU VISÃO NO PROJETO:**
> 1. Consulte sempre [/docs/bots/INDEX.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/INDEX.md) e [/docs/bots/AI_INSTRUCTIONS.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/AI_INSTRUCTIONS.md).
> 2. **NUNCA invente modelos YOLO falsos** (`fake.pt`, mocks que fingem ser modelos reais). Se não houver pesos treinados para um objeto pedido pelo usuário, declare explicitamente `MODEL_REQUIRED` e instrua a coleta de dataset e treinamento.
> 3. **NUNCA execute PyTorch ou YOLO diretamente** dentro de um bot novo. Reutilize sempre o `VisionEngine` (`sdk.bot_sdk.vision`).
> 4. **NUNCA implemente captura de tela avulsa**. Use o `CaptureEngine` (`sdk.bot_sdk.capture`).
> 5. **NUNCA chame bibliotecas de teclado/mouse (`pynput`, `pywin32`, etc.) diretamente** na estratégia do bot. Use o `InputEngine` e `ActionQueue` (`sdk.bot_sdk.input`).
> 6. **SEMPRE defina um `bot.json`** em conformidade estrita com o schema `schemas/bot-manifest.schema.json`.
> 7. **SEMPRE registre novos modelos** no `ModelRegistry` e novos datasets no `DatasetRegistry`.
> 8. **SEMPRE atualize os catálogos** (`BOT_CATALOG.md`, `MODEL_CATALOG.md`, `DATASET_CATALOG.md`) após adicionar ou modificar componentes.

---

## 🗺️ Mapa Rápido da Documentação Interna (Bots)
- Arquitetura Central: [/docs/bots/ARCHITECTURE.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/ARCHITECTURE.md)
- Como Criar um Novo Bot: [/docs/bots/CREATING_A_BOT.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/CREATING_A_BOT.md)
- Motor de Visão & YOLO: [/docs/bots/VISION_ENGINE.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/VISION_ENGINE.md)
- Treinamento com `yolov5_mm2`: [/docs/bots/YOLO_TRAINING.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/YOLO_TRAINING.md)
- Exemplo Real (MM2): [/docs/bots/examples/mm2-coin-collector.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/examples/mm2-coin-collector.md)
- Exemplo Didático para IAs (Teddy Collector): [/docs/bots/examples/teddy-collector.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/examples/teddy-collector.md)

---

## 🖱️ Instruções para o Módulo Auto Click
> [!IMPORTANT]
> **LEIA ISTO ANTES DE ALTERAR O AUTO CLICK:**
> 1. Consulte [/docs/autoclick/README.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/autoclick/README.md) e [/docs/autoclick/AI_INSTRUCTIONS.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/autoclick/AI_INSTRUCTIONS.md).
> 2. **O Auto Click NÃO deve depender de Python**. Use sempre a infraestrutura nativa Tauri/Rust (`src-tauri/src/autoclick_engine.rs`) e o `InputService`.
> 3. **NUNCA crie loops infinitos no JavaScript** (`while(true)`). Delegue todo o timing para o motor de alta precisão em Rust.
> 4. **SEMPRE libere teclas e cliques** (`release_all_inputs_native`) ao finalizar ou abortar automações.
> 5. **NUNCA oculte o indicador 🔴 REC** durante gravações. Preserva-se sempre a privacidade do usuário.

