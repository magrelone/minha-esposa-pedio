# Estratégia de Testes & Replay Testing (TESTING.md)

Para validar a integridade dos bots sem exigir que o jogo esteja aberto e sem pressionar teclas reais, o SDK fornece testes baseados em **Replay**.

---

## 1. O Pipeline de Replay Test
```
Imagens Gravadas (.png)
         ↓
  CaptureEngine (Mock)
         ↓
    VisionEngine
         ↓
   BotStrategy
         ↓
  MockInputEngine (Assert de Teclas)
```

---

## 2. Exemplo de Teste de Decisão
```python
def test_coin_collector_decision():
    img = load_test_image("tests/replays/mm2_scene.png")
    detections = vision.detect(img)
    actions = strategy.decide(detections, context)
    assert any(a.action_type == ActionType.MOVE_FORWARD for a in actions)
```
Isso permite testes contínuos (CI/CD) com 100% de estabilidade.
