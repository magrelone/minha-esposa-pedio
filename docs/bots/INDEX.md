# Índice Central da Plataforma de Bots (INDEX.md)

Bem-vindo ao índice mestre de documentação da plataforma de bots e automação de visão computacional de **💕 Pedi para meu marido**.

Esta documentação é considerada **código-fonte de primeira classe**. Qualquer IA, agente ou desenvolvedor humano que for criar ou alterar bots neste projeto deve consultar e manter estes documentos atualizados.

---

## 🧭 Mapa de Documentos

| Categoria | Documento | Descrição |
| :--- | :--- | :--- |
| **Geral & Agentes** | [README.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/README.md) | Visão geral da plataforma e filosofia |
| | [AI_INSTRUCTIONS.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/AI_INSTRUCTIONS.md) | Regras inegociáveis para agentes de IA |
| | [ARCHITECTURE.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/ARCHITECTURE.md) | Diagrama de camadas do Bot SDK e Vision SDK |
| **Criação & Ciclo** | [CREATING_A_BOT.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/CREATING_A_BOT.md) | Passo a passo de ponta a ponta para novo bot |
| | [BOT_MANIFEST.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/BOT_MANIFEST.md) | Especificação do manifesto `bot.json` |
| | [BOT_LIFECYCLE.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/BOT_LIFECYCLE.md) | Estados, ciclo de vida e protocolo IPC |
| **Visão & IA** | [VISION_ENGINE.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/VISION_ENGINE.md) | Pipeline de inferência YOLOv5 e ONNX |
| | [YOLO_TRAINING.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/YOLO_TRAINING.md) | Guia de treinamento via `yolov5_mm2` |
| | [DATASETS.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/DATASETS.md) | Estrutura de datasets e splits 70/20/10 |
| | [ANNOTATIONS.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/ANNOTATIONS.md) | Formato YOLO de bounding box e validação |
| | [MODELS.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/MODELS.md) | Model Registry, metadados e hashing |
| **Engenharia de Ação** | [CAPTURE_ENGINE.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/CAPTURE_ENGINE.md) | Captura de tela, DPI e ROI |
| | [INPUT_ENGINE.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/INPUT_ENGINE.md) | Emulação de entrada, filas e simulação segura |
| | [NAVIGATION.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/NAVIGATION.md) | Cálculo de distâncias e coordenadas de tela |
| | [DECISION_ENGINE.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/DECISION_ENGINE.md) | Estratégia, seletores de alvo e Failsafes |
| **Operação & Testes** | [CONFIGURATION.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/CONFIGURATION.md) | Perfis de configuração dinâmicos |
| | [DEBUGGING.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/DEBUGGING.md) | Logs, telemetria e diagnóstico |
| | [TESTING.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/TESTING.md) | Testes unitários e Replay Tests |
| | [PERFORMANCE.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/PERFORMANCE.md) | Métricas de latência e FPS |
| | [GPU.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/GPU.md) | Suporte a NVIDIA CUDA e CPU Fallback |
| | [ADDING_NEW_GAMES.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/ADDING_NEW_GAMES.md) | Como adicionar bots para novos jogos |
| **Catálogos & Exemplos** | [BOT_CATALOG.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/BOT_CATALOG.md) | Lista oficial de bots registrados |
| | [MODEL_CATALOG.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/MODEL_CATALOG.md) | Lista oficial de pesos disponíveis |
| | [DATASET_CATALOG.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/DATASET_CATALOG.md) | Lista oficial de datasets de treino |
| | [EXAMPLES.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/EXAMPLES.md) | Catálogo de exemplos práticos |
| | [examples/mm2-coin-collector.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/examples/mm2-coin-collector.md) | Caso real: Roblox MM2 Coin Collector |
| | [examples/teddy-collector.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/examples/teddy-collector.md) | Caso didático: Teddy Collector para IAs |
