# Motor de Decisão & Seleção de Alvos (DECISION_ENGINE.md)

O `DecisionEngine` (`sdk.bot_sdk.decision`) desacopla a visão computacional das decisões táticas do bot.

---

## 1. Seletores de Alvo (`TargetSelector`)
Quando o modelo detecta múltiplos objetos na tela (ex.: 5 moedas espalhadas), o `TargetSelector` oferece critérios determinísticos:
- `closest_to_center`: Seleciona o objeto com menor distância euclidiana ao centro da tela.
- `highest_confidence`: Seleciona o objeto com maior score percentual de confiança.
- `nearest_screen_bottom`: Seleciona o objeto posicionado mais abaixo na tela (geralmente o mais próximo fisicamente do personagem).

---

## 2. Padrão Estratégia (`BotStrategy`)
Toda IA e lógica de bot deve implementar a interface:
```python
class BotStrategy(ABC):
    @abstractmethod
    def decide(self, detections: List[Detection], context: BotContext) -> List[Action]:
        pass
```
Isso permite trocar o cérebro do bot sem alterar os subsistemas de captura ou envio de teclas.
