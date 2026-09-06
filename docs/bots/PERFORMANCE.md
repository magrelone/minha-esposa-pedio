# Métricas de Performance & Latência (PERFORMANCE.md)

O módulo de telemetria do Bot SDK mede cada etapa do pipeline isoladamente:

---

## 1. Decomposição da Latência
- **Latência de Captura**: Tempo decorrido entre a requisição do frame e a conversão para array NumPy (típico: 5 a 15 ms).
- **Latência de Inferência**: Tempo de execução da rede neural YOLOv5 (GPU: 8 a 18 ms / CPU: 40 a 90 ms).
- **Latência de Decisão**: Tempo de cálculo da estratégia e seleção de alvos (típico: < 1 ms).
- **Latência Total**: Tempo do frame do jogo até o envio da ação correspondente.

---

## 2. Recomendações de Otimização
- Desative o preview visual na interface quando o bot estiver operando em segundo plano.
- Reduza a resolução de captura (`640x640` ou `480x480`) para quadruplicar o FPS de inferência em CPUs mais lentas.
