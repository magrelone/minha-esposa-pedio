# Wallpaper Studio & Live Engine — Especificação Técnica

## Wallpapers Estáticos
- Aplicação nativa com a API Win32 `SystemParametersInfoW(SPI_SETDESKWALLPAPER, 0, path, SPIF_UPDATEINIFILE | SPIF_SENDCHANGE)`.
- Compatibilidade universal com JPG, PNG, WEBP e BMP.
- Preservação do caminho do papel de parede anterior para reversão (*Undo*).

## Live Wallpaper Engine
- Suporte a vídeos (MP4, WebM), GIFs animados e Canvas interativos.
- **Auto-Pause em Tela Cheia:** Pausa a renderização durante jogos ou vídeos em tela cheia para manter 100% dos FPS do jogo.
- **Auto-Pause na Bateria:** Detecta `GetSystemPowerStatus` para economizar energia quando desconectado da tomada.
