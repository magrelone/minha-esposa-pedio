# Alvos e Janelas (TARGET_WINDOWS.md)

O **TargetManager** suporta tanto coordenadas absolutas quanto coordenadas relativas à janela em foco.

## 1. Modos de Coordenadas
- **Coordenadas Absolutas da Tela**: $X$ e $Y$ no espaço virtual da área de trabalho do Windows (suportando monitores à esquerda com coordenadas negativas).
- **Coordenadas Relativas à Janela**:
  $X_{absoluto} = X_{janela} + X_{relativo}$
  $Y_{absoluto} = Y_{janela} + Y_{relativo}$
  Permite que a automação continue clicando no mesmo elemento mesmo se a janela do jogo for movida de lugar.
- **Coordenadas Percentuais (%)**:
  $X = 50\%, Y = 50\%$ representa sempre o centro geométrico da janela, independente de resolução.

## 2. Validação da Janela
Antes de enviar ações relativas à janela, o sistema verifica via Win32:
- Se a janela ainda existe (`IsWindow`).
- Se a janela está visível e não minimizada (`IsIconic`).
- Se as dimensões continuam válidas.
