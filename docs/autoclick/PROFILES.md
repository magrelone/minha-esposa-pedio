# Perfis e Predefinições (PROFILES.md)

O sistema de perfis permite armazenar, versionar e compartilhar configurações completas de automação.

## 1. Estrutura do Perfil (`.autoclick`)
Os arquivos `.autoclick` utilizam JSON com schema versionado:

```json
{
  "schemaVersion": 1,
  "id": "prof-1725400000000",
  "name": "Mineração Roblox MM2",
  "description": "Cliques rápidos no botão esquerdo a 15 CPS",
  "clickMode": "fixed",
  "intervalMs": 66.7,
  "cps": 15.0,
  "mouseButton": "left",
  "clickType": "single",
  "positionMode": "current_cursor",
  "repeatMode": "infinite",
  "hotkeys": {
    "startStop": "F6",
    "emergencyStop": "ESC"
  },
  "safety": {
    "cornerFailsafe": true,
    "maxRuntimeMinutes": 60
  }
}
```

## 2. Predefinições Embutidas (Presets)
- **Normal (10 CPS)**: 100ms
- **Rápido (20 CPS)**: 50ms
- **Ultra (50 CPS)**: 20ms
- **Lento (1 CPS)**: 1000ms
- **Duplo Clique**: 200ms com double click
- **Segurar Botão**: Hold contínuo
