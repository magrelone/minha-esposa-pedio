# Reprodução de Macros (PLAYBACK.md)

O **PlaybackEngine** reexecuta as ações gravadas ou montadas no Automation Builder.

## 1. Multiplicadores de Velocidade
O usuário pode ajustar a velocidade de reprodução:
- `0.5x`: Câmera lenta para validação visual ou jogos de ritmo pausado.
- `1.0x`: Velocidade original capturada.
- `1.5x` / `2.0x`: Aceleração de rotinas repetitivas.

Ao alterar a velocidade, todos os atrasos (`delay_before`, `wait`, `duration`) são multiplicados proporcionalmente por $\frac{1}{velocidade}$.

## 2. Modos de Repetição
- **Execução Única**: Roda a sequência uma vez e para.
- **Repetir N Vezes**: Repete a sequência completa pelo número configurado de iterações.
- **Repetir Infinitamente**: Repete até o usuário pressionar Parar ou a tecla de pânico.
