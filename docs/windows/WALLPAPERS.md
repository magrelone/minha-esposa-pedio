# Wallpaper Studio — Banco de Dados Expandido (Animes, Mangás, Manhwas & Cute)

## 1. Categorias Expandidas
- **🌸 Animes:** Artes conceituais, lofi study, estética sakura e cyberpunk neon.
- **📖 Mangás (Preto e Branco):** Painéis e traços tradicionais de mangás de ação e drama com alto contraste.
- **⚡ Manhwas:** Webtoons coloridos de ação/fantasia (estilo Solo Leveling, Blue Flames) e romances em tons pastel.
- **💕 Cute:** Temas dedicados com carinho para a esposa em tons suaves de rosa e lilás.
- **🎮 Gaming:** Sintetizadores dos anos 80, synthwave e mechas de combate em 4K.

## 2. Sistema de Filtros em Tempo Real
- **Filtro por Categoria:** Alternância instantânea entre as 6 categorias temáticas.
- **Filtro de Resolução:** `4K UHD`, `Full HD 1080p` e `Ultrawide 21:9`.
- **Busca por Tags:** Pesquisa instantânea por tags (`solo leveling`, `lofi`, `sakura`, `neon`, etc.).

## 3. Aplicação Segura & Rollback
- O aplicativo faz download local para `%APPDATA%\PediParaMeuMarido\wallpapers\active_wallpaper.jpg` garantindo arquivo físico no disco.
- Chama nativamente a Win32 API `SystemParametersInfoW(SPI_SETDESKWALLPAPER, 0, path, SPIF_UPDATEINIFILE | SPIF_SENDCHANGE)`.
- Botão "↩️ Desfazer" e "Restaurar Wallpaper Padrão do Windows" sempre ativos.
