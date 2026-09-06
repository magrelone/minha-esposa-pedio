# Segurança e Failsafes (SAFETY.md)

O **SafetyManager** implementa proteções ativas para garantir que o usuário mantenha total controle do computador.

## 1. Parada de Pânico (Panic Key)
A tecla de emergência (por padrão `ESC` ou `F6`) interrompe imediatamente qualquer automação, esvazia a fila de ações e chama `release_all_inputs_native()`.

## 2. Corner Failsafe (Canto da Tela)
Se o cursor for empurrado rapidamente para o canto superior esquerdo da tela (coordenadas $X \le 5$ e $Y \le 5$), o loop de trabalho do Rust detecta a posição e para a automação no mesmo milissegundo.

## 3. Liberação Segura de Teclas (Release All)
Toda parada aciona a emissão de `MOUSEEVENTF_LEFTUP`, `MOUSEEVENTF_RIGHTUP`, `MOUSEEVENTF_MIDDLEUP` e `KEYEVENTF_KEYUP` para as teclas de movimento e modificadores, impedindo que o cursor fique travado em clique contínuo.

## 4. Proteção de Auto-Clique (Prevent Self Click)
Por padrão, ao usar modo de posição dinâmica, o sistema evita clicar sobre a própria janela de controle do **Pedi para meu marido**.
