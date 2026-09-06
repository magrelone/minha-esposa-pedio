# Arquitetura Técnica — Windows Customization Studio

Este documento detalha o funcionamento interno do módulo **Windows Customization Studio**.

## 1. Visão Arquitetural

```
┌─────────────────────────────────────────────────────────────┐
│                 React 18 + Vite (Frontend)                  │
│    src/projects/windows/                                    │
│    ├── WindowsApp.tsx (Hub & Toolbar com botão Desfazer)    │
│    ├── store/windowsStore.ts (Estado global & Snapshots)    │
│    ├── services/undoService.ts (Reversor universal)         │
│    ├── services/licenseService.ts (Governança de licenças)  │
│    └── views/ (18 submódulos visuais e configuradores)      │
├─────────────────────────────────────────────────────────────┤
│                 Tauri 2.0 IPC Layer                         │
│    invoke("windows_get_os_info")                            │
│    invoke("windows_safe_restart_explorer")                  │
│    invoke("windows_rebuild_icon_cache")                     │
│    invoke("windows_set_desktop_wallpaper")                  │
│    invoke("windows_restore_default_wallpaper")              │
├─────────────────────────────────────────────────────────────┤
│                 Rust Native Core Backend                    │
│    src-tauri/src/windows_customizer.rs                      │
│    ├── Win32 API Segura (SystemParametersInfoW, etc.)       │
│    ├── Gerenciamento não-destrutivo de registros de usuário │
│    └── Monitoramento de status de energia (Bateria / AC)    │
└─────────────────────────────────────────────────────────────┘
```

## 2. O Padrão Universal de Desfazer (Undo / Rollback)

Cada operação segue a sequência obrigatória de 4 etapas:
1. **Captura do Estado Anterior:** O estado antes da modificação é gravado em memória e persistido.
2. **Execução Segura:** Apenas APIs homologadas e seguras são chamadas.
3. **Disponibilização da Reversão:** O botão de "↩️ Desfazer" é ativado na interface do card correspondente e na barra de ferramentas superior.
4. **Reversão com 1 Clique:** Ao clicar em Desfazer, o estado anterior é restaurado com total fidelidade e o Explorer é atualizado se necessário.
