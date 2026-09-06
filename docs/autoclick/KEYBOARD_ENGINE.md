# Motor de Teclado (KEYBOARD_ENGINE.md)

O **KeyboardEngine** permite automatizar o acionamento repetido de teclas ou manter teclas pressionadas continuamente.

## 1. Mapeamento de Virtual-Keys (VK)
O motor converte strings amigáveis para códigos virtuais da API Win32:
- Letras A–Z: Códigos ASCII correspondentes (`0x41` a `0x5A`)
- Espaço: `0x20`
- Enter: `0x0D`
- Escape: `0x1B`
- Tab: `0x09`
- Shift: `0x10`
- Ctrl / Control: `0x11`
- Alt: `0x12`
- Teclas de Função F1 a F12: `0x70` a `0x7B`

## 2. Injeção de Teclas
A injeção é realizada via `SendInput` com `INPUT_KEYBOARD`:
- Pressionar: `dwFlags = 0`
- Soltar: `dwFlags = KEYEVENTF_KEYUP (0x0002)`

## 3. Garantia de Liberação de Teclas (Release All Inputs)
Ao encerrar qualquer automação (seja por conclusão normal, botão de parar ou atalho de emergência), o motor executa imediatamente `release_all_inputs_native()` para soltar botões do mouse e teclas comuns (Shift, Ctrl, Alt, Espaço, W, A, S, D, E), garantindo que nenhuma tecla permaneça travada no sistema operacional.
