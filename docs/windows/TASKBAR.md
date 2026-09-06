# Taskbar Studio — Especificação Técnica

O **Taskbar Studio** controla o alinhamento de ícones (Centro / Esquerda), visibilidade de segundos no relógio da bandeja do sistema e efeitos de transparência (Blur / Acrylic).

## Chaves de Registro Seguras (HKCU)
- Alinhamento: `HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarAl` (0 = Esquerda, 1 = Centro)
- Segundos no Relógio: `HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\ShowSecondsInSystemClock` (0 = Oculto, 1 = Visível)
- Ícones de Pesquisa: `HKCU\Software\Microsoft\Windows\CurrentVersion\Search\SearchboxTaskbarMode`

Todas as alterações afetam apenas a conta do usuário atual e possuem botão de reversão imediata (*Desfazer*).
