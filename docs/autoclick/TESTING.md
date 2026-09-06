# Testes e Validação (TESTING.md)

Orientações para testes do Auto Click Studio:

## 1. Modo de Simulação (Test Mode)
O estúdio possui o **Modo de Simulação / Teste** em Configurações. Quando ativado:
- O motor de temporização e a linha do tempo executam normalmente.
- A telemetria de CPS e latência é medida em tempo real.
- As chamadas nativas ao Win32 `SendInput` são suprimidas, permitindo validar lógicas de loop e timings sem clicar na área de trabalho.

## 2. Testes Automatizados (Vitest)
Executados via:
```bash
npm test
```
Validam:
- Cálculo bidirecional de CPS ↔ Milissegundos.
- Limites de divisão por zero.
- Variação de intervalos e jitter numérico.
- Validação de schema do `.autoclick`.
- Consistência de links e integridade de arquivos de documentação.
