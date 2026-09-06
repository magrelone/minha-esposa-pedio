# Segurança, Backup e Política de Desfazer — Windows Customization Studio

## 1. Segurança Rigorosa (`SECURITY.md`)
- **Sem DLL Patches:** Nunca alteramos binários nativos do sistema.
- **Sem Modificação de Bootloader:** Boot e UEFI permanecem 100% originais e intocados.
- **Sem Elevação Abusiva:** Apenas configurações do usuário atual são tocadas. O app roda em privilégio padrão de usuário.

## 2. Backup & Rollback Center (`BACKUP.md` e `RESTORE.md`)
- Todo evento de personalização registra um `SystemChangeRecord` com `previousState` e `newState`.
- Cada card exibe botão dedicado de "↩️ Desfazer".
- Botão "Emergency Recovery" no topo para restauro instantâneo dos padrões de fábrica.

## 3. Matriz de Compatibilidade (`COMPATIBILITY.md`)
- **Windows 11 (Build >= 22000):** Suporte nativo a Mica, centralização de barra de tarefas, cantos arredondados e novo Menu Iniciar.
- **Windows 10:** Suporte nativo a Acrylic, barra de tarefas alinhada à esquerda, temas claro/escuro e papéis de parede.
