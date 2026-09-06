# Depuração e Diagnóstico (DEBUGGING.md)

Este documento orienta como diagnosticar problemas em execuções de bots.

---

## 1. Níveis de Log Estruturados
O console integrado filtra logs nas seguintes categorias:
- **`INFO`**: Eventos normais do ciclo de vida (inicialização, carregamento de modelo).
- **`VISION`**: Detecções relevantes e métricas de inferência.
- **`MOVEMENT`**: Movimentos calculados e teclas acionadas.
- **`WARNING`**: Avisos como janela do jogo minimizada ou ausência de objetos.
- **`ERROR`**: Exceções críticas que exigiram parada do bot.

---

## 2. Diagnóstico de Permissões
- Para capturar jogos em tela cheia exclusiva, certifique-se de executar o jogo em modo Janela Sem Bordas (Borderless Windowed).
- Verifique se o Python possui permissão de leitura de tela e envio de comandos de acessibilidade no Windows.
