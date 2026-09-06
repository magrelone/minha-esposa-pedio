# Temporização de Alta Precisão (TIMING.md)

Para evitar acumulação de atraso (drift) em frequências altas como 20 CPS ou 50 CPS, o motor nativo utiliza scheduling baseado em timestamps absolutos.

## 1. Eliminação do Drift Progressivo
O erro clássico de autoclickers ingênuos é executar:
```
sleep(interval) -> clique -> sleep(interval)
```
Se a ação de clique consumir 2ms, o relógio atrasa progressivamente 2ms a cada iteração.

No **AutoClickEngine**, o agendamento é computado sobre uma âncora `target_next_time`:
```rust
target_next_time += Duration::from_micros((interval_ms * 1000.0) as u64);
let now = Instant::now();

if target_next_time > now {
    let diff = target_next_time - now;
    if diff > Duration::from_millis(2) {
        thread::sleep(diff - Duration::from_millis(1));
    }
    while Instant::now() < target_next_time {
        std::hint::spin_loop();
    }
}
```
Isso garante precisão sub-milissegundo com drift próximo de zero.

## 2. Relação Bidirecional CPS ↔ Intervalo
- $Intervalo (ms) = \frac{1000}{CPS}$
- $CPS = \frac{1000}{Intervalo (ms)}$

Exemplos:
- 10 CPS $\rightarrow$ 100 ms
- 20 CPS $\rightarrow$ 50 ms
- 50 CPS $\rightarrow$ 20 ms
- Divisão por zero é estritamente prevenida fixando $CPS \ge 0.1$ e $Intervalo \ge 1ms$.
