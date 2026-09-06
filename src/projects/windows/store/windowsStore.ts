import { create } from "zustand";
import {
  AppearanceConfig,
  CompatibilityLevel,
  CursorConfig,
  CustomizationCategory,
  DesktopWidgetConfig,
  ExplorerConfig,
  SoundConfig,
  StartMenuConfig,
  TaskbarConfig,
  WallpaperConfig,
  WindowsOsInfo,
} from "../types";
import { undoService } from "../services/undoService";
import { invoke } from "@tauri-apps/api/core";

export const DEFAULT_APPEARANCE: AppearanceConfig = {
  mode: "dark",
  accentColor: "#ec4899", // Rosa vibrante carinhoso
  transparency: true,
  opacity: 85,
  useMica: true,
  useAcrylic: true,
  roundedCorners: true,
  dropShadows: true,
  titleBarAccent: false,
};

export const DEFAULT_START_MENU: StartMenuConfig = {
  layout: "windows11",
  alignment: "center",
  showRecentFiles: false,
  showRecommended: false,
  showPowerShortcuts: true,
  searchBarVisible: true,
  iconSize: "medium",
};

export const DEFAULT_TASKBAR: TaskbarConfig = {
  position: "bottom",
  alignment: "center",
  transparencyMode: "blur",
  showSecondsInClock: true,
  showSearch: true,
  showTaskView: false,
  showWidgetsBadge: false,
  compactIcons: false,
};

export const DEFAULT_EXPLORER: ExplorerConfig = {
  compactView: true,
  showFileExtensions: true,
  showHiddenFiles: false,
  showPreviewPane: false,
  showDetailsPane: false,
  openTo: "this_pc",
};

export const DEFAULT_WALLPAPER: WallpaperConfig = {
  activeWallpaperId: "default_windows",
  wallpaperPath: "C:\\Windows\\Web\\Wallpaper\\Windows\\img0.jpg",
  fitMode: "fill",
  isLive: false,
  pauseWhenFullscreen: true,
  pauseOnBattery: true,
  fpsLimit: 60,
};

export const DEFAULT_SOUND: SoundConfig = {
  activePackId: "windows_default",
  packName: "Windows Padrão",
  playStartupSound: true,
  playNotificationSound: true,
  volume: 75,
};

export const DEFAULT_CURSOR: CursorConfig = {
  activePackId: "windows_default",
  packName: "Aero Padrão",
  sizeMultiplier: 1.0,
  trailEnabled: false,
};

export const DEFAULT_WIDGETS: DesktopWidgetConfig[] = [
  {
    id: "wdg_clock",
    title: "Relógio Digital & Data",
    type: "clock",
    enabled: true,
    position: { x: 40, y: 40 },
    pinned: true,
    alwaysOnTop: false,
    clickThrough: false,
    style: "cute",
  },
  {
    id: "wdg_cpu",
    title: "Monitor CPU & Memória",
    type: "cpu_ram",
    enabled: true,
    position: { x: 40, y: 180 },
    pinned: false,
    alwaysOnTop: false,
    clickThrough: false,
    style: "fluent",
  },
  {
    id: "wdg_notes",
    title: "Recadinho do Marido 💕",
    type: "notes",
    enabled: true,
    position: { x: 40, y: 320 },
    pinned: true,
    alwaysOnTop: false,
    clickThrough: false,
    style: "cute",
  },
];

interface WindowsState {
  osInfo: WindowsOsInfo | null;
  activeCategory: CustomizationCategory;
  changeHistoryCount: number;
  isApplying: boolean;
  notificationMessage: string | null;

  appearance: AppearanceConfig;
  startMenu: StartMenuConfig;
  taskbar: TaskbarConfig;
  explorer: ExplorerConfig;
  wallpaper: WallpaperConfig;
  sound: SoundConfig;
  cursor: CursorConfig;
  widgets: DesktopWidgetConfig[];

  // Actions
  fetchOsInfo: () => Promise<void>;
  setActiveCategory: (cat: CustomizationCategory) => void;
  showNotification: (msg: string) => void;

  updateAppearance: (newConfig: Partial<AppearanceConfig>, title?: string) => void;
  updateStartMenu: (newConfig: Partial<StartMenuConfig>, title?: string) => void;
  updateTaskbar: (newConfig: Partial<TaskbarConfig>, title?: string) => void;
  updateExplorer: (newConfig: Partial<ExplorerConfig>, title?: string) => void;
  updateWallpaper: (newConfig: Partial<WallpaperConfig>, title?: string) => Promise<void>;
  updateSound: (newConfig: Partial<SoundConfig>, title?: string) => void;
  updateCursor: (newConfig: Partial<CursorConfig>, title?: string) => void;
  toggleWidget: (widgetId: string) => void;

  // Undo & Rollback Actions
  undoLastChange: () => Promise<boolean>;
  undoSpecificChange: (changeId: string) => Promise<boolean>;
  revertCategoryToDefault: (cat: CustomizationCategory) => Promise<void>;
  restoreAllToDefaults: () => Promise<void>;
}

export const useWindowsStore = create<WindowsState>((set, get) => {
  // Inicialização com listeners de histórico
  undoService.subscribe(() => {
    set({ changeHistoryCount: undoService.getChangeCount() });
  });

  return {
    osInfo: null,
    activeCategory: "quick",
    changeHistoryCount: undoService.getChangeCount(),
    isApplying: false,
    notificationMessage: null,

    appearance: DEFAULT_APPEARANCE,
    startMenu: DEFAULT_START_MENU,
    taskbar: DEFAULT_TASKBAR,
    explorer: DEFAULT_EXPLORER,
    wallpaper: DEFAULT_WALLPAPER,
    sound: DEFAULT_SOUND,
    cursor: DEFAULT_CURSOR,
    widgets: DEFAULT_WIDGETS,

    fetchOsInfo: async () => {
      try {
        const info = await invoke<WindowsOsInfo>("windows_get_os_info");
        set({ osInfo: info });
      } catch (e) {
        // Fallback para preview no navegador
        set({
          osInfo: {
            os_name: "Windows 11",
            build_number: "22631",
            architecture: "x86_64",
            edition: "Pro",
            is_win11: true,
            mica_supported: true,
            acrylic_supported: true,
            dark_mode_supported: true,
            current_theme_is_dark: true,
          },
        });
      }
    },

    setActiveCategory: (cat) => set({ activeCategory: cat }),

    showNotification: (msg) => {
      set({ notificationMessage: msg });
      setTimeout(() => set({ notificationMessage: null }), 3500);
    },

    updateAppearance: (newConfig, title = "Aparência Atualizada") => {
      const prev = get().appearance;
      const updated = { ...prev, ...newConfig };
      undoService.recordChange("appearance", title, "Alteração de tema e cores", prev, updated, false);
      set({ appearance: updated });
      get().showNotification(`✨ ${title}`);
    },

    updateStartMenu: (newConfig, title = "Menu Iniciar Atualizado") => {
      const prev = get().startMenu;
      const updated = { ...prev, ...newConfig };
      undoService.recordChange("start_menu", title, "Configurações do Start Menu", prev, updated, true);
      set({ startMenu: updated });
      get().showNotification(`🚀 ${title}`);
    },

    updateTaskbar: (newConfig, title = "Barra de Tarefas Atualizada") => {
      const prev = get().taskbar;
      const updated = { ...prev, ...newConfig };
      undoService.recordChange("taskbar", title, "Alinhamento e transparência da barra", prev, updated, true);
      set({ taskbar: updated });
      get().showNotification(`📌 ${title}`);
    },

    updateExplorer: (newConfig, title = "Explorer Atualizado") => {
      const prev = get().explorer;
      const updated = { ...prev, ...newConfig };
      undoService.recordChange("explorer", title, "Exibição e organização do Explorer", prev, updated, true);
      set({ explorer: updated });
      get().showNotification(`📁 ${title}`);
    },

    updateWallpaper: async (newConfig, title = "Papel de Parede Alterado") => {
      const prev = get().wallpaper;
      const updated = { ...prev, ...newConfig };
      undoService.recordChange("wallpapers", title, "Mudança de wallpaper estático/animado", prev, updated, false);
      set({ wallpaper: updated });

      if (updated.wallpaperPath && !updated.isLive) {
        try {
          await invoke("windows_set_desktop_wallpaper", { path: updated.wallpaperPath });
        } catch {}
      }
      get().showNotification(`🖼️ ${title}`);
    },

    updateSound: (newConfig, title = "Esquema de Som Atualizado") => {
      const prev = get().sound;
      const updated = { ...prev, ...newConfig };
      undoService.recordChange("sounds", title, "Alteração dos efeitos sonoros", prev, updated, false);
      set({ sound: updated });
      get().showNotification(`🔊 ${title}`);
    },

    updateCursor: (newConfig, title = "Cursores Atualizados") => {
      const prev = get().cursor;
      const updated = { ...prev, ...newConfig };
      undoService.recordChange("cursors", title, "Pacote de cursores do mouse", prev, updated, false);
      set({ cursor: updated });
      get().showNotification(`🖱️ ${title}`);
    },

    toggleWidget: (widgetId) => {
      const prev = get().widgets;
      const updated = prev.map((w) => (w.id === widgetId ? { ...w, enabled: !w.enabled } : w));
      undoService.recordChange("widgets", "Widgets de Desktop", "Alternância de visibilidade", prev, updated, false);
      set({ widgets: updated });
    },

    // Executa a reversão restaurando o estado exato
    undoSpecificChange: async (changeId: string) => {
      const success = await undoService.undoChange(changeId, async (cat, prevState) => {
        switch (cat) {
          case "appearance":
            set({ appearance: prevState });
            break;
          case "start_menu":
            set({ startMenu: prevState });
            break;
          case "taskbar":
            set({ taskbar: prevState });
            break;
          case "explorer":
            set({ explorer: prevState });
            break;
          case "wallpapers":
            set({ wallpaper: prevState });
            if (prevState.wallpaperPath) {
              try {
                await invoke("windows_set_desktop_wallpaper", { path: prevState.wallpaperPath });
              } catch {}
            }
            break;
          case "sounds":
            set({ sound: prevState });
            break;
          case "cursors":
            set({ cursor: prevState });
            break;
          case "widgets":
            set({ widgets: prevState });
            break;
        }
      });

      if (success) {
        get().showNotification("↩️ Alteração desfeita com sucesso!");
      }
      return success;
    },

    undoLastChange: async () => {
      const history = undoService.getHistory();
      const last = history.find((c) => c.status === "applied" && c.canUndo);
      if (!last) {
        get().showNotification("Nenhuma alteração recente para desfazer.");
        return false;
      }
      return await get().undoSpecificChange(last.id);
    },

    revertCategoryToDefault: async (cat) => {
      switch (cat) {
        case "appearance":
          get().updateAppearance(DEFAULT_APPEARANCE, "Restaurado Aparência Original");
          break;
        case "start_menu":
          get().updateStartMenu(DEFAULT_START_MENU, "Restaurado Start Menu Original");
          break;
        case "taskbar":
          get().updateTaskbar(DEFAULT_TASKBAR, "Restaurado Barra de Tarefas Original");
          break;
        case "explorer":
          get().updateExplorer(DEFAULT_EXPLORER, "Restaurado Explorer Original");
          break;
        case "wallpapers":
          try {
            await invoke("windows_restore_default_wallpaper");
          } catch {}
          get().updateWallpaper(DEFAULT_WALLPAPER, "Restaurado Wallpaper Padrão");
          break;
        case "sounds":
          get().updateSound(DEFAULT_SOUND, "Restaurado Esquema de Som Padrão");
          break;
        case "cursors":
          get().updateCursor(DEFAULT_CURSOR, "Restaurado Cursores Padrão");
          break;
        case "widgets":
          set({ widgets: DEFAULT_WIDGETS });
          get().showNotification("🧩 Widgets restaurados para o padrão");
          break;
      }
    },

    restoreAllToDefaults: async () => {
      set({ isApplying: true });
      try {
        await invoke("windows_restore_default_wallpaper");
      } catch {}
      set({
        appearance: DEFAULT_APPEARANCE,
        startMenu: DEFAULT_START_MENU,
        taskbar: DEFAULT_TASKBAR,
        explorer: DEFAULT_EXPLORER,
        wallpaper: DEFAULT_WALLPAPER,
        sound: DEFAULT_SOUND,
        cursor: DEFAULT_CURSOR,
        widgets: DEFAULT_WIDGETS,
        isApplying: false,
      });
      try {
        await invoke("windows_safe_restart_explorer");
      } catch {}
      get().showNotification("🛡️ Emergency Recovery: Todo o sistema foi restaurado aos padrões seguros!");
    },
  };
});
