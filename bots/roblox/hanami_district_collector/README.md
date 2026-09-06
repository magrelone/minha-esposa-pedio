# 🌸 Hanami Spirit Collector (Roblox)

Automação inteligente e AFK para o jogo **Distrito de Hanami** no Roblox.

---

## 📍 Mapear Ruas (evitar paredes)

1. Em **Configurações do bot**, escolha o modo **📍 Mapear Ruas (gravar WASD)**.
2. Inicie o bot e clique no Roblox.
3. **Ande você mesmo** com `W A S D` pelas ruas (sem bater na parede).
4. Atalhos:
   - **F4** — marca um checkpoint
   - **F3** — desfaz o último ponto
   - **END** — termina e salva em `waypoints.json`
5. Volte ao modo **Coleta de Ursos** e inicie de novo — a patrulha usa a rota que você gravou.

---

## 🎯 Objetos e Alvos
1. **🤍 Espírito Branco (*White Spirit / Sakura Cat*)**: Gato cintilante com aura rosada e olhos lilases.
2. **🖤 Espírito Preto (*Shadow Cat / Kuro Spirit*)**: Gato escuro com partículas mágicas e orelhas roxas.

---

## 🕹️ Mecânicas & Funcionamento
- **Mapeamento do Mapa Estático**: Utiliza um grafo de patrulha cíclica por waypoints pelas rotas conhecidas de spawn de Hanami.
- **Delay de Coleta (3 segundos)**: Ao alcançar o espírito, a estratégia imobiliza o personagem e mantém a interação pelo tempo estipulado (~3.2s) para garantir a absorção antes de continuar a caminhada.
- **Detecção de Travamento**: Pulos automáticos esporádicos e rotinas de desvencilhamento em caso de obstáculos.

---

## 🧠 Visão Computacional & YOLO
- **Pesos**: `yolo11_hanami_spirits.pt`
- **Classes**:
  - `0`: `urso_branco`
  - `1`: `urso_preto`
