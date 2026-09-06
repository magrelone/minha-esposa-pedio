# Licenciamento de Assets & Governança de Direitos Autorais

Para permitir comercialização, distribuição limpa e segurança jurídica do aplicativo **Pedi para meu marido**, cada asset no banco deve cumprir o schema:

```json
{
  "id": "ast_123",
  "licenseName": "CC0 1.0 Universal",
  "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
  "author": "Nome do Criador",
  "sourceUrl": "https://fonte-oficial.com",
  "commercialUse": true,
  "redistributionAllowed": true,
  "modificationAllowed": true,
  "attributionRequired": false,
  "sha256Hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "localCopyAllowed": true,
  "verifiedAt": "2026-09-06"
}
```

## Regras
1. Assets sob licença "Apenas para Uso Pessoal" não podem ser empacotados em distribuições comerciais sem autorização explícita do autor.
2. Priorizar fontes sob licenças CC0, MIT, Apache 2.0 e Bootstrap/Simple Icons.
