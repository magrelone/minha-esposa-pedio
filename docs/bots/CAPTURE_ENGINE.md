# Motor de Captura de Tela (CAPTURE_ENGINE.md)

O `CaptureEngine` (`sdk.bot_sdk.capture`) é o único módulo autorizado a interagir com os subsistemas de captura de tela do sistema operacional.

---

## 1. Modos Suportados
1. **Janela (`window`)**: Procura a janela pelo título (ex.: `"Roblox"`) e captura apenas a área delimitada pelo retalho da janela.
2. **Monitor (`monitor`)**: Captura o monitor completo especificado pelo índice.
3. **Região Customizada (`region`)**: Captura as coordenadas exatas `(x, y, largura, altura)` definidas pelo usuário através do retângulo visual.

---

## 2. Compatibilidade com DPI do Windows
O motor inicializa com `windll.user32.SetProcessDPIAware()` para garantir que coordenadas obtidas em telas com zoom (125%, 150%) correspondam aos pixels físicos reais.
