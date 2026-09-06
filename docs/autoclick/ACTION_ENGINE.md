# Motor de Ações (ACTION_ENGINE.md)

O **ActionEngine** é o orquestrador sequencial de eventos do Auto Click Studio.

## 1. Tipos de Ações Suportadas

| Tipo | Descrição | Parâmetros Principais |
| :--- | :--- | :--- |
| `mouse.click` | Clique em posição atual ou coordenada | `button` (`left`, `right`, `middle`), `click_type`, `x`, `y`, `delay_ms` |
| `mouse.move` | Movimento do cursor | `x`, `y`, `duration_ms` |
| `mouse.scroll` | Rolagem de roda do mouse | `delta`, `delay_ms` |
| `keyboard.press` | Pressionar e soltar tecla | `key` (ex: `"E"`, `"SPACE"`), `delay_ms` |
| `keyboard.down` | Segurar tecla pressionada | `key` |
| `keyboard.up` | Soltar tecla | `key` |
| `wait` | Pausa fixa na timeline | `duration_ms` |
| `random_wait` | Pausa randômica em intervalo | `min_ms`, `max_ms` |
| `loop.start` | Início de repetição de bloco | `iterations` |
| `loop.end` | Fim de repetição de bloco | — |
| `comment` | Anotação explicativa na timeline | `text` |

## 2. Estrutura de Loops e Recursão
- O motor utiliza uma pilha de loops (`loop_stack`) no Rust para rastrear o índice da instrução `loop.start`, a contagem máxima e a iteração atual.
- Limite de profundidade de aninhamento para prevenir estouro de pilha e recursões infinitas indesejadas.
- Todas as pausas (`thread::sleep`) verificam o sinal atômico `is_running` a cada iteração para resposta imediata ao botão de Parar.
