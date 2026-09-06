# Adicionando Bots para Novos Jogos (ADDING_NEW_GAMES.md)

O módulo de Bots é universal e suporta qualquer jogo desktop para Windows, não apenas Roblox.

---

## 1. Etapas para um Novo Jogo
1. **Identificar o Título da Janela**:
   - Defina o `window_title` no arquivo `config.py` ou `bot.json` correspondente ao título da janela do jogo (ex.: `"Minecraft"`, `"League of Legends"`, `"Genshin Impact"`).
2. **Definir as Coordenadas de Referência**:
   - Para jogos em primeira pessoa, o centro da mira é `xc = 0.5, yc = 0.5`.
   - Para jogos em terceira pessoa isométrica ou aérea, calibre a posição relativa do personagem.
3. **Coletar Imagens & Treinar**:
   - Utilize a ferramenta de gravação de dataset (`Record Dataset`) para extrair amostras do novo jogo e treinar um modelo YOLO customizado.
