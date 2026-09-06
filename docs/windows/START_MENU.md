# Start Menu Studio — Especificação Técnica

O módulo **Start Menu Studio** permite a alternância de layouts do menu iniciar entre estilos Windows 11 Fluent, Windows 10, Windows 7 e Minimalista, priorizando APIs oficiais e seguras.

## Regras de Execução
1. Modificações do layout do Windows 11 devem respeitar o schema oficial `LayoutModification.json` documentado pela Microsoft.
2. Não injetar bibliotecas em `explorer.exe` ou `StartMenuExperienceHost.exe`.
3. Oferecer sempre botão de **Restaurar Start Menu Original**.
