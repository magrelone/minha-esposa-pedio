# Motor de Entrada & Emulação Segura (INPUT_ENGINE.md)

O `InputEngine` (`sdk.bot_sdk.input`) é responsável por executar comandos de teclado e mouse sem riscos de congelamento de teclas.

---

## 1. Tipos de Ações Padronizadas
As estratégias não emitem nomes de teclas diretamente, mas instâncias de `Action`:
- `ActionType.MOVE_FORWARD` (W)
- `ActionType.MOVE_BACKWARD` (S)
- `ActionType.MOVE_LEFT` (A)
- `ActionType.MOVE_RIGHT` (D)
- `ActionType.JUMP` (Space)
- `ActionType.LOOK_LEFT` / `ActionType.LOOK_RIGHT`
- `ActionType.WAIT`
- `ActionType.CUSTOM`

---

## 2. Garantia de Liberação de Teclas (`Failsafe`)
Quando o processo é pausado, parado ou sofre uma exceção não tratada, o método `release_all_keys()` é disparado imediatamente para evitar que o personagem continue correndo no jogo descontroladamente.
