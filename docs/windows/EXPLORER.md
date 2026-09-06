# File Explorer Studio — Especificação Técnica

O **File Explorer Studio** ajusta opções seguras de usabilidade do Windows Explorer e fornece reinicialização limpa do processo para aplicação de temas sem reiniciar a máquina.

## Configurações Suportadas
- Visualização compacta (densidade de listas).
- Extensões de arquivos visíveis (`HideFileExt = 0`).
- Itens ocultos (`Hidden = 1`).
- Reinício gracioso do processo com `taskkill /F /IM explorer.exe` seguido de `start explorer.exe`.
