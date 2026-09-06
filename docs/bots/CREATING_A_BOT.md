# Guia: Como Criar um Novo Bot (CREATING_A_BOT.md)

Este tutorial ensina o procedimento padrão para criar uma nova automação na plataforma.

---

## Passo 1: Executar o Gerador de Scaffold
Não crie pastas manualmente do zero. Utilize a ferramenta interna de scaffold:
```bash
python sdk/tools/create_bot.py --name "Nome do Bot" --game "Roblox" --type "vision"
```
Isso gerará a estrutura canônica:
```
bots/roblox/nome_do_bot/
├── bot.json
├── main.py
├── config.py
├── strategy.py
├── tests/
└── README.md
```

---

## Passo 2: Preencher o `bot.json`
Configure os metadados e os modelos exigidos no manifesto:
```json
{
  "schemaVersion": 1,
  "id": "roblox.nome-do-bot",
  "name": "Nome do Bot",
  "game": "Roblox",
  "experience": "Nome da Experiência",
  "provider": "internal",
  "runtime": "python",
  "capabilities": ["screen_capture", "object_detection", "keyboard", "movement"],
  "vision": {
    "provider": "legacy-yolov5",
    "models": ["yolo_coin_m_v3.pt"]
  },
  "entrypoint": "main.py"
}
```

---

## Passo 3: Implementar a Estratégia em `strategy.py`
Herde de `BotStrategy` e implemente a função `decide`:
```python
from sdk.bot_sdk.decision import BotStrategy
from sdk.bot_sdk.input import Action, ActionType

class MinhaEstrategia(BotStrategy):
    def decide(self, detections, context):
        # 1. Filtra objetos de interesse
        alvos = [d for d in detections if d.class_name == "alvo"]
        if not alvos:
            return [Action(ActionType.EXPLORE)]

        # 2. Escolhe o melhor alvo usando TargetSelector
        alvo_escolhido = self.target_selector.closest_to_center(alvos)

        # 3. Calcula movimento
        return self.navigation.move_towards(alvo_escolhido)
```

---

## Passo 4: Executar e Testar
1. Valide o manifesto contra o JSON Schema:
   ```bash
   python sdk/tools/validate_manifest.py bots/roblox/nome_do_bot/bot.json
   ```
2. Execute o Replay Test para validar as decisões com imagens gravadas:
   ```bash
   python -m unittest discover -s bots/roblox/nome_do_bot/tests
   ```
3. Registre o bot em `docs/bots/BOT_CATALOG.md`.
