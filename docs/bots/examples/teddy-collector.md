# Exemplo Didático para IAs: "Teddy Collector" (teddy-collector.md)

> [!NOTE]
> **ATENÇÃO IA/AGENT**: Este é um **exemplo didático** criado especificamente para ensinar você como proceder quando o usuário pedir um bot para um novo jogo e novo objeto que ainda não possui modelo treinado.

---

## O Cenário
O usuário faz o seguinte pedido:
> *"Crie um bot para Roblox que encontre ursinhos gigantes (teddy) espalhados pelo mapa e caminhe até eles."*

---

## O Que a IA DEVE Fazer (Passo a Passo)

### 1. Pesquisa nos Registros
- A IA consulta `ModelRegistry.get_model_by_class("teddy")` → **Retorna `None`** (nenhum modelo existente detecta a classe `"teddy"`).
- A IA consulta `DatasetRegistry.get_dataset_by_class("teddy")` → **Retorna `None`** (não há dataset pronto).

### 2. Declaração Formal de `MODEL_REQUIRED`
A IA **NÃO** inventa um arquivo `teddy.pt` nem gera detecções fake. Ela responde ao usuário:
> *"Para criar o Teddy Collector, primeiro precisamos criar o modelo detector para a classe `teddy`. O fluxo será:*
> *1. Usar a ferramenta Record Dataset para coletar 50 a 100 imagens dos ursinhos no jogo;*
> *2. Fazer as anotações no Annotation Tool;*
> *3. Iniciar o treino via TrainingManager com o perfil Balanced;*
> *4. Com os pesos `best.pt` gerados, instanciar o bot via Bot Scaffold Generator."*

### 3. Como Seria o Manifesto do Bot (`bot.json`)
```json
{
  "schemaVersion": 1,
  "id": "roblox.teddy.collector",
  "name": "🧸 Teddy Collector",
  "game": "Roblox",
  "experience": "Teddy Map Adventure",
  "provider": "internal",
  "runtime": "python",
  "capabilities": ["screen_capture", "object_detection", "keyboard", "movement"],
  "vision": {
    "provider": "legacy-yolov5",
    "models": ["teddy-detector-v1"]
  },
  "entrypoint": "main.py"
}
```

### 4. Como Seria a Estratégia (`strategy.py`)
```python
from sdk.bot_sdk.decision import BotStrategy
from sdk.bot_sdk.input import Action, ActionType

class TeddyCollectorStrategy(BotStrategy):
    def decide(self, detections, context):
        teddies = [d for d in detections if d.class_name == "teddy"]
        if not teddies:
            return [Action(ActionType.EXPLORE, message="Procurando ursinho pelo mapa")]

        alvo = self.target_selector.closest_to_center(teddies)
        return self.navigation.move_towards(alvo)
```
Este exemplo didático demonstra a separação limpa entre a necessidade de treino e a lógica de decisão.
