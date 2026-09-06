# Instruções para Agentes de IA (AI_INSTRUCTIONS.md)

> [!IMPORTANT]
> **LEIA ISTO ANTES DE MODIFICAR OU ADICIONAR RECURSOS AO MÓDULO AUTO CLICK:**
> 1. Consulte sempre `/docs/autoclick/README.md` e `/docs/autoclick/ARCHITECTURE.md`.
> 2. **NUNCA crie automações com loops JavaScript ingênuos** como `while(true) sleep(...)` no React. Toda execução de clique e temporização deve rodar através do `InputService` e do motor nativo em Rust (`src-tauri/src/autoclick_engine.rs`).
> 3. **NUNCA implemente captura oculta de teclado ou mouse**. Qualquer modo de gravação deve expor claramente o indicador 🔴 REC e respeitar os princípios de privacidade.
> 4. **NUNCA introduza dependências de Python no módulo Auto Click**. O Auto Click é 100% nativo em Rust / Tauri.
> 5. **SEMPRE garanta liberação segura de teclas** no encerramento de qualquer nova ação implementada (`release_all_inputs_native`).
> 6. **SEMPRE mantenha sincronizado o cálculo de CPS ↔ Intervalo** sem divisão por zero.
