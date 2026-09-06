# Gravador de Macros (RECORDER.md)

O **Recorder** permite capturar interações do usuário (cliques, posições, teclas e rolagem) para convertê-las em ações na linha do tempo.

## 1. Princípios de Segurança & Privacidade
- **Indicador Visível (🔴 REC)**: O gravador exibe sempre um badge animado na tela enquanto estiver ativo. Nenhuma captura oculta é realizada.
- **Proteção de Senhas**: As teclas capturadas destinam-se estritamente à execução da macro atual. Não existe gravação contínua ou armazenamento de texto livre em disco.

## 2. Simplificação de Trajetória do Mouse
Para evitar armazenar milhares de micro-movimentos redundantes, o gravador aplica simplificação de caminho (algoritmo Ramer-Douglas-Peucker ou descarte por limiar de distância euclidiana $\Delta d < 5px$), preservando os pontos de inflexão do movimento sem sobrecarregar a memória.
