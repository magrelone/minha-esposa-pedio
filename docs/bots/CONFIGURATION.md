# Configurações Dinâmicas de Bots (CONFIGURATION.md)

O módulo de Bots permite ajustar configurações tanto antes do início quanto em tempo real via comando `CONFIG_UPDATE`.

---

## 1. Parâmetros Suportados

| Parâmetro | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `weights` | string | `yolo_coin_m_v3.pt` | Caminho do modelo de visão |
| `device` | string | `"auto"` | `"auto"`, `"cuda"` ou `"cpu"` |
| `conf_thres` | float | `0.25` | Limiar mínimo de confiança |
| `simulation_mode` | bool | `true` | Se ativo, não emite teclas reais |
| `send_preview` | bool | `true` | Se ativo, transmite frames para a UI |
| `preview_fps` | int | `6` | Taxa máxima de frames de preview |
| `jump_prob` | float | `0.10` | Frequência de pulos |
| `mode` | string | `"coin_only"` | Modo operacional do bot |
