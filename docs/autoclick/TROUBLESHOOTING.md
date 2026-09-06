# Resolução de Problemas (TROUBLESHOOTING.md)

Diagnósticos e soluções para situações comuns:

## 1. O jogo não recebe os cliques
- Alguns jogos rodando como Administrador exigem que o próprio aplicativo seja executado com privilégios equivalentes para que `SendInput` seja aceito.
- Verifique se o jogo aceita cliques diretos ou se possui proteção contra entradas sintéticas.

## 2. Cliques em monitores secundários estão deslocados
- Abra **Configurações de Exibição** do Windows e certifique-se de que a escala de DPI de ambos os monitores é reconhecida.
- Utilize o botão **🎯 Escolher na Tela** para capturar a coordenada real absoluta corrigida para o monitor alvo.

## 3. As teclas continuam sendo pressionadas após fechar
- Pressione a tecla de pânico (`ESC`) ou acione o Corner Failsafe no canto superior esquerdo da tela para forçar a liberação de todas as teclas.
