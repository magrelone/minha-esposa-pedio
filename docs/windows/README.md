# Windows Customization Studio (🪟 Windows)

O **Windows Customization Studio** é uma suíte unificada, moderna e segura para personalização visual e funcional do Windows 10 e Windows 11, integrada nativamente ao aplicativo **Pedi para meu marido**.

---

## 🎯 Filosofia e Diretrizes Fundamentais

1. **Simplicidade Externa, Potência Interna:**  
   A tela inicial é limpa, acolhedora e intuitiva para qualquer usuário, especialmente pensada com amor e carinho. Configurações avançadas, scripts e ajustes de precisão residem em submenus organizados.

2. **Interface Obrigatória de Desfazer (Universal Undo / Rollback):**  
   **Toda e qualquer alteração possui botão imediato de "↩️ Desfazer"**.  
   Antes de aplicar qualquer mudança, um snapshot do estado anterior é registrado no histórico com possibilidade de reversão individual ou restauração de emergência (*Emergency Recovery*).

3. **Segurança Máxima (Zero Bricking Policy):**  
   - 🚫 **NUNCA** substituir DLLs de sistema.  
   - 🚫 **NUNCA** injetar código em processos de segurança.  
   - 🚫 **NUNCA** alterar o bootloader do Windows.  
   - 🚫 **NUNCA** desativar mecanismos de segurança do sistema operacional.  
   - Cada recurso é categorizado transparentemente como `SUPPORTED`, `EXPERIMENTAL` ou `UNSUPPORTED / RISKY`.

4. **Transparência e Licenciamento de Assets:**  
   Todo asset integrado (ícone, cursor, som, wallpaper ou widget) armazena seus metadados de licença, autor, links de verificação e autorizações de redistribuição comercial/pessoal.

---

## 🗺️ Mapa da Documentação Técnica

| Documento | Descrição |
|-----------|-----------|
| [ARCHITECTURE.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/ARCHITECTURE.md) | Arquitetura geral, fluxo de dados e comunicação Tauri/Rust |
| [START_MENU.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/START_MENU.md) | Personalização do Menu Iniciar e launcher alternativo |
| [TASKBAR.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/TASKBAR.md) | Barra de tarefas, alinhamento, relógio e transparência |
| [EXPLORER.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/EXPLORER.md) | Opções seguras do Explorador de Arquivos e reinicialização |
| [ICONS.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/ICONS.md) | Pacotes de ícones e conversor ICO/PNG |
| [FOLDERS.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/FOLDERS.md) | Cores e personalização de pastas de usuário |
| [CURSORS.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/CURSORS.md) | Esquemas de cursores normais e animados (.cur / .ani) |
| [SOUNDS.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/SOUNDS.md) | Esquemas sonoros do sistema (XP, 7, Cute, Sci-Fi) |
| [FONTS.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/FONTS.md) | Pré-visualizador de tipografia e proteção de fontes críticas |
| [LOGIN.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/LOGIN.md) | Tela de login e personalização de identidade |
| [LOCK_SCREEN.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/LOCK_SCREEN.md) | Tela de bloqueio e slideshows |
| [BOOT.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/BOOT.md) | Diretrizes estritas de boot e inicialização segura |
| [WALLPAPERS.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/WALLPAPERS.md) | Wallpapers estáticos, múltiplos monitores e agendador |
| [LIVE_WALLPAPER.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/LIVE_WALLPAPER.md) | Engine de live wallpaper com pausa para jogos/bateria |
| [WIDGETS.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/WIDGETS.md) | Widgets de área de trabalho e sandbox de permissões |
| [THEMES.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/THEMES.md) | Pacotes completos no formato `.pdmtheme` |
| [ASSET_LIBRARY.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/ASSET_LIBRARY.md) | Biblioteca de assets, busca global e categorização |
| [LICENSES.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/LICENSES.md) | Governança de direitos autorais e conformidade de licenças |
| [BACKUP.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/BACKUP.md) | Criação de backups e snapshots antes de mudanças |
| [RESTORE.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/RESTORE.md) | Motor de reversão (Undo), Rollback e Emergency Recovery |
| [SECURITY.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/SECURITY.md) | Auditoria de segurança e permissões de privilégio |
| [PERFORMANCE.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/PERFORMANCE.md) | Otimização de GPU/VRAM e controle de bateria |
| [COMPATIBILITY.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/COMPATIBILITY.md) | Matriz de compatibilidade Windows 10 vs Windows 11 |
| [AI_INSTRUCTIONS.md](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/windows/AI_INSTRUCTIONS.md) | Diretrizes e checklist obrigatório para IAs de código |
