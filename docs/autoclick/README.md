# 🖱️ Auto Click — Central de Automação de Mouse e Teclado

Módulo nativo de alta precisão integrado ao **💕 Pedi para meu marido**. Desenvolvido para oferecer desde cliques imediatos e simples até automações completas de múltiplos pontos, sequências complexas e gravação de macros em tempo real.

---

## 🗺️ Mapa da Documentação Interna
1. [Arquitetura Geral](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/autoclick/ARCHITECTURE.md)
2. [Motor de Ações (Action Engine)](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/autoclick/ACTION_ENGINE.md)
3. [Motor de Mouse (Mouse Engine)](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/autoclick/MOUSE_ENGINE.md)
4. [Motor de Teclado (Keyboard Engine)](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/autoclick/KEYBOARD_ENGINE.md)
5. [Temporização de Alta Precisão (Timing)](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/autoclick/TIMING.md)
6. [Gravador de Macros (Recorder)](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/autoclick/RECORDER.md)
7. [Reprodução (Playback)](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/autoclick/PLAYBACK.md)
8. [Alvos e Janelas (Target Windows)](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/autoclick/TARGET_WINDOWS.md)
9. [Perfis e Predefinições (Profiles)](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/autoclick/PROFILES.md)
10. [Atalhos Globais (Hotkeys)](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/autoclick/HOTKEYS.md)
11. [Segurança & Failsafes (Safety)](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/autoclick/SAFETY.md)
12. [Resolução de Problemas (Troubleshooting)](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/autoclick/TROUBLESHOOTING.md)
13. [Testes & Validação (Testing)](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/autoclick/TESTING.md)
14. [Instruções para Agentes de IA (AI Instructions)](file:///c:/Projetos/Minha%20Esposa%20Pedio/docs/autoclick/AI_INSTRUCTIONS.md)

---

## ⚡ Níveis de Operação
* **Simples (Quick Click)**: Configuração em poucos segundos com botão do mouse, cálculo bidirecional de CPS ↔ Milissegundos e atalho Insert.
* **Avançado**: Variação de intervalos (*Base + Jitter*, *Random Interval*, *Random CPS*), limites de repetição e atraso de início com contagem regressiva (*3..2..1 ✨*).
* **Sequências & Multi-Point**: Coordenação de dezenas de coordenadas na tela com delays individuais, ou linha do tempo com cliques, movimentações, rolagem de scroll, teclas e blocos de loop.
