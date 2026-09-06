# Instruções para Inteligências Artificiais e Agentes de Código (AI_INSTRUCTIONS.md)

> [!IMPORTANT]
> **LEIA ISTO ANTES DE QUALQUER MODIFICAÇÃO NO MÓDULO WINDOWS:**
> 1. **SEMPRE FORNEÇA UMA INTERFACE DE DESFAZER (UNDO)** para cada personalização ou funcionalidade adicionada.
> 2. **NUNCA substitua DLLs** ou arquivos de sistema do Windows (`C:\Windows\System32`, `uxtheme.dll`, etc.).
> 3. **NUNCA altere o bootloader** ou chaves protegidas de hardware/segurança.
> 4. **NUNCA assuma que um recurso do Windows 11 funciona no Windows 10** sem verificar a build do sistema.
> 5. **SEMPRE registre a licença** de qualquer asset adicionado ao banco (`CC0`, `MIT`, `Creative Commons`, `Uso Comercial`).
> 6. **SEMPRE gere um Snapshot** antes de aplicar alterações em massa ou temas completos.

---

## 📋 Checklist de Nova Funcionalidade

Toda nova funcionalidade no módulo Windows deve atender:
- [ ] Possui estado prévio mapeado?
- [ ] Possui botão visível de "↩️ Desfazer"?
- [ ] A reversão restaura o estado sem reiniciar a máquina?
- [ ] Se precisar reiniciar o Explorer, avisa o usuário com confirmação?
- [ ] Está categorizada (`SUPPORTED`, `EXPERIMENTAL`, `UNSUPPORTED`)?
- [ ] Possui documentação de licença associada?
