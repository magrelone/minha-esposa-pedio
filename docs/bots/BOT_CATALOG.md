# Catálogo Oficial de Bots (BOT_CATALOG.md)

> [!NOTE]
> Este arquivo deve ser atualizado automaticamente toda vez que um novo bot for registrado no sistema.

---

## 1. Bots Disponíveis

### 🪙 MM2 Coin Collector
- **ID**: `roblox.mm2.coin-collector`
- **Jogo**: Roblox — Murder Mystery 2
- **Provedor**: `andrewwongwong/RobloxBot` (Adaptado para Bot SDK)
- **Tipo**: Visão Computacional (YOLOv5)
- **Objetos Detectados**: `coin` (Moedas), `person` (Jogadores)
- **Ações**: `MOVE_FORWARD`, `MOVE_BACKWARD`, `MOVE_LEFT`, `MOVE_RIGHT`, `JUMP`
- **Modelos Suportados**: `yolo_coin_m_v3.pt`, `yolo_coin_person_m_v2.pt`
- **Status**: Ativo & Operacional
- **Manifest**: [bots/roblox/mm2_coin_collector/bot.json](file:///c:/Projetos/Minha%20Esposa%20Pedio/bots/roblox/mm2_coin_collector/bot.json)
- **Documentação**: [docs/bots/examples/mm2-coin-collector.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/bots/examples/mm2-coin-collector.md)

### 🌸 Hanami Spirit Collector
- **ID**: `roblox.hanami.spirit-collector`
- **Jogo**: Roblox — Distrito de Hanami
- **Provedor**: Minha Esposa Pediu / Internal
- **Tipo**: Visão Computacional (YOLOv5) & Waypoint Patrol
- **Objetos Detectados**: `white_spirit` (Gatos Brancos), `black_spirit` (Gatos Pretos)
- **Ações**: `MOVE_FORWARD`, `MOVE_BACKWARD`, `MOVE_LEFT`, `MOVE_RIGHT`, `WAIT` (Dwell 3s), `JUMP`
- **Modelos Suportados**: `yolo_hanami_spirits_v1.pt` (MODEL_REQUIRED)
- **Status**: Homologado & Em Coleta de Dataset
- **Manifest**: [bots/roblox/hanami_district_collector/bot.json](file:///c:/Projetos/Minha%20Esposa%20Pedio/bots/roblox/hanami_district_collector/bot.json)
- **Waypoints**: [bots/roblox/hanami_district_collector/waypoints.json](file:///c:/Projetos/Minha%20Esposa%20Pedio/bots/roblox/hanami_district_collector/waypoints.json)
- **Documentação**: [bots/roblox/hanami_district_collector/README.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/bots/roblox/hanami_district_collector/README.md)

---

## 2. Bots em Desenvolvimento / Roadmap
- `roblox.blade-ball.auto-parry`: Roblox — Blade Ball (Visão e Reflexos)
- `desktop.generic.auto-fisher`: Minigame Universal de Pesca
