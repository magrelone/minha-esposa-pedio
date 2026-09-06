# Navegação Espacial em Tela (NAVIGATION.md)

O `NavigationEngine` (`sdk.bot_sdk.navigation`) transforma coordenadas relativas de detecções 2D em comandos de direcionamento para o personagem.

---

## 1. Posição Referencial do Personagem
No Roblox (terceira pessoa), a posição visual aproximada do personagem fica em:
- `xc = 0.5` (centro horizontal)
- `yc = 0.75` (três quartos da altura da tela)

---

## 2. Estratégia de Aproximação (`move_towards`)
- Se `alvo.rel_center[0] > xc + 0.03`: Move para a Direita (`D`).
- Se `alvo.rel_center[0] < xc - 0.03`: Move para a Esquerda (`A`).
- Se `alvo.rel_center[1] > yc + 0.03`: Move para Baixo/Atrás (`S`).
- Se `alvo.rel_center[1] < yc - 0.03`: Move para Cima/Frente (`W`).
- Possibilidade de pulo estocástico (`JUMP`) para transpor pequenos desníveis.
