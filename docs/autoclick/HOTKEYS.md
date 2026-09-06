# Atalhos Globais (HOTKEYS.md)

O **HotkeyManager** gerencia os atalhos de teclado em nível de sistema operacional (funcionando mesmo quando outro jogo ou janela estiver em tela cheia).

## 1. Atalhos Padrão
- **`Insert`**: Iniciar / Parar automação imediatamente (parada forçada com liberação nativa de todas as teclas e cliques via `release_all_inputs_native`).
- **`ESC`**: Parada de emergência (Panic Key) instantânea quando em execução.
- **`F7`**: Capturar coordenada atual sob o cursor do mouse.
- **`F8`**: Pausar / Retomar automação em andamento.

## 2. Registro Nativo & Resolução de Conflitos
Os atalhos são gerenciados pelo Tauri através do plugin nativo `tauri-plugin-global-shortcut`.
- O atalho `Insert` é escutado diretamente na thread principal do sistema operacional via Rust. Quando acionado durante uma automação rápida, ele força `engine.stop(...)` e invoca `AutoClickEngine::release_all_inputs_native()` sem depender do ciclo de renderização do JavaScript ou foco de janela.
- O Crosshair Overlay fica restrito exclusivamente ao seu próprio atalho (`F10` ou `Control+Alt+X`), sem interferir na operação do Auto Click.
