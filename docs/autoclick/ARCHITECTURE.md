# Arquitetura do Auto Click (ARCHITECTURE.md)

O **Auto Click Studio** adota uma arquitetura dividida estritamente em duas camadas:

```mermaid
graph TD
    ReactUI[React / Zustand Studio UI] -->|Tauri Commands IPC| TauriCommands[src-tauri lib.rs Commands]
    TauriCommands --> NativeEngine[AutoClickEngine (Rust Worker Thread)]
    TauriCommands --> SQLiteDB[AutoClickDatabase (rusqlite)]
    NativeEngine --> Timer[HighPrecisionTimer (QueryPerformanceCounter)]
    NativeEngine --> SendInput[Win32 SendInput API]
    NativeEngine --> Failsafe[SafetyManager & Panic Hotkey]
    SendInput --> OSInputs[Mouse & Teclado do Windows]
```

## 1. Camada Frontend (React + TypeScript)
- **`AutoClickApp.tsx`**: Casca do aplicativo com abas de navegação (Quick, MultiPoint, Builder, Recorder, Keyboard, Profiles, History, Settings).
- **`autoclickStore.ts`**: Store Zustand com persistência em LocalStorage (`pmm-autoclick-store`) e sincronização em tempo real do CPS ↔ Intervalo.
- **`Core Automation SDK`**: Serviços reutilizáveis (`InputService`, `HotkeyService`, `WindowService`, `MonitorService`).

## 2. Camada Backend (Rust + Win32 API)
- **`autoclick_engine.rs`**: Motor nativo rodando em thread de alta prioridade (`thread::spawn`). Utiliza scheduling baseado em âncoras de tempo (`Instant::now()` e anti-drift) e invoca a API documentada `SendInput` do Windows.
- **`autoclick_db.rs`**: Persistência relacional em SQLite com 8 tabelas dedicadas (`autoclick_profiles`, `autoclick_actions`, `autoclick_points`, `autoclick_hotkeys`, `autoclick_history`, `autoclick_runs`, `autoclick_schedules`, `autoclick_settings`).

## 3. Garantia de Desacoplamento & Não Dependência de Python
Diferente do módulo de Bots, que requer PyTorch e YOLOv5, o Auto Click não possui qualquer dependência de interpretadores Python ou bibliotecas externas de automação.
