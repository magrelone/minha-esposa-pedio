# Guia de Especificações — Ícones, Pastas, Cursores, Sons e Fontes

## 1. Icon Studio (`ICONS.md`)
- Converte imagens PNG/SVG para ICO com múltiplas resoluções: 16x16, 24x24, 32x32, 48x48, 64x64, 128x128, 256x256.
- Altera atalhos, lixeira e pastas de sistema apenas via registro do usuário (`HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\CLSID`).

## 2. Folder Studio (`FOLDERS.md`)
- Customização não-destrutiva via arquivo local `desktop.ini` nas pastas do usuário.
- Cada pasta possui comando de restauração para o ícone padrão amarelo do Windows.

## 3. Cursor Studio (`CURSORS.md`)
- Suporte a arquivos de ponteiro estáticos (`.cur`) e animados (`.ani`).
- Registrado em `HKCU\Control Panel\Cursors`.
- Atualizado via API Win32 `SystemParametersInfoW(SPI_SETCURSORS, 0, NULL, 0)` com rollback garantido.

## 4. Sound Studio (`SOUNDS.md`)
- Esquemas de som mapeados em `HKCU\AppEvents\Schemes\Apps\.Default`.
- Suporte a arquivos WAV em 16-bit 44.1kHz.
- Botão "Restaurar Esquema Padrão do Windows" sempre disponível.

## 5. Font Studio (`FONTS.md`)
- Pré-visualizador tipográfico interativo.
- Proteção contra remoção de fontes críticas de interface do sistema (`Segoe UI`, `Calibri`, `Arial`).
