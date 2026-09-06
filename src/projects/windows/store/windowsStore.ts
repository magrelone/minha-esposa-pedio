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
  accentColor: "#ec4899", // Rosa carinhoso
  transparency: true,
  opacity: 85,
  useMica: true,
  useAcrylic: true,
  roundedCorners: true,
  dropShadows: true,
  titleBarAccent: false,
};

export const DEFAULT_START_MENU: StartMenuConfig = {
  layout: "hybrid_win7_11",
  alignment: "left",
  showRecentFiles: false,
  showRecommended: false,
  showPowerShortcuts: true,
  searchBarVisible: true,
  iconSize: "medium",
  replaceNativeStartButton: true,
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

  applyPreset: (presetId: string, title: string) => Promise<void>;
  updateAppearance: (newConfig: Partial<AppearanceConfig>, title?: string) => Promise<void>;
  updateStartMenu: (newConfig: Partial<StartMenuConfig>, title?: string) => Promise<void>;
  updateTaskbar: (newConfig: Partial<TaskbarConfig>, title?: string) => Promise<void>;
  updateExplorer: (newConfig: Partial<ExplorerConfig>, title?: string) => Promise<void>;
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
        if (info.current_theme_is_dark !== undefined) {
          set((s) => ({
            appearance: {
              ...s.appearance,
              mode: info.current_theme_is_dark ? "dark" : "light",
            },
          }));
        }
      } catch (e) {
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
            username: "Usuário",
            display_name: "Usuário",
            gpu_name: "GPU do Sistema",
            cpu_name: "Processador",
            total_ram_gb: "16",
          },
        });
      }
    },

    setActiveCategory: (cat) => set({ activeCategory: cat }),

    showNotification: (msg) => {
      set({ notificationMessage: msg });
      setTimeout(() => set({ notificationMessage: null }), 3500);
    },

    applyPreset: async (presetId: string, title: string) => {
      set({ isApplying: true });
      const prev = {
        appearance: get().appearance,
        taskbar: get().taskbar,
        wallpaper: get().wallpaper,
      };

      try {
        await invoke("windows_apply_complete_preset", { presetId });
        undoService.recordChange("quick", title, "Preset completo aplicado no Windows", prev, presetId, false);

        if (presetId === "cute_pink") {
          set((s) => ({
            appearance: { ...s.appearance, mode: "dark", accentColor: "#ec4899" },
            taskbar: { ...s.taskbar, alignment: "center", showSecondsInClock: true },
          }));
        } else if (presetId === "win11_fluent") {
          set((s) => ({
            appearance: { ...s.appearance, mode: "dark", accentColor: "#0078d4" },
            taskbar: { ...s.taskbar, alignment: "center", showSecondsInClock: true },
          }));
        } else if (presetId === "win10_classic") {
          set((s) => ({
            appearance: { ...s.appearance, mode: "dark", accentColor: "#0284c7" },
            taskbar: { ...s.taskbar, alignment: "left", showSecondsInClock: false },
          }));
        } else if (presetId === "win7_aero") {
          set((s) => ({
            appearance: { ...s.appearance, mode: "light", accentColor: "#0ea5e9" },
            taskbar: { ...s.taskbar, alignment: "left", showSecondsInClock: false },
          }));
        } else if (presetId === "cyberpunk_neon") {
          set((s) => ({
            appearance: { ...s.appearance, mode: "dark", accentColor: "#eab308" },
            taskbar: { ...s.taskbar, alignment: "center", showSecondsInClock: true },
          }));
        }

        get().showNotification(`✨ ${title}`);
      } catch (e) {
        console.error("Erro ao aplicar preset:", e);
        get().showNotification(`Erro ao aplicar preset: ${e}`);
      } finally {
        set({ isApplying: false });
      }
    },

    updateAppearance: async (newConfig, title = "Aparência Atualizada") => {
      const prev = get().appearance;
      const updated = { ...prev, ...newConfig };
      undoService.recordChange("appearance", title, "Tema e cores do Windows", prev, updated, false);
      set({ appearance: updated });

      try {
        if (newConfig.mode) {
          await invoke("windows_apply_theme_mode", { mode: newConfig.mode });
        }
        if (newConfig.accentColor) {
          await invoke("windows_apply_accent_color", { hexColor: newConfig.accentColor });
        }
      } catch (e) {
        console.warn("Falha na chamada nativa de aparência:", e);
      }
      get().showNotification(`✨ ${title}`);
    },

    updateStartMenu: async (newConfig, title = "Menu Iniciar Atualizado") => {
      const prev = get().startMenu;
      const updated = { ...prev, ...newConfig };
      undoService.recordChange("start_menu", title, "Configurações do Start Menu", prev, updated, true);
      set({ startMenu: updated });

      try {
        await invoke("windows_apply_start_menu_config", {
          showRecent: updated.showRecentFiles,
          showRecommended: updated.showRecommended,
        });

        // Se escolher clássico (Win 7 ou Win 10), move o menu nativo para a esquerda
        if (newConfig.layout === "windows7" || newConfig.layout === "windows10") {
          await invoke("windows_apply_taskbar_config", {
            alignment: "left",
            showSeconds: get().taskbar.showSecondsInClock,
            searchVisible: get().taskbar.showSearch,
          });
          set((s) => ({ taskbar: { ...s.taskbar, alignment: "left" } }));
        } else if (newConfig.layout === "windows11") {
          await invoke("windows_apply_taskbar_config", {
            alignment: "center",
            showSeconds: get().taskbar.showSecondsInClock,
            searchVisible: get().taskbar.showSearch,
          });
          set((s) => ({ taskbar: { ...s.taskbar, alignment: "center" } }));
          await invoke("windows_set_start_menu_replacement", { enabled: false });
        } else if (newConfig.layout === "hybrid_win7_11") {
          await invoke("windows_set_start_menu_replacement", { enabled: true });
        }

        if (newConfig.replaceNativeStartButton !== undefined) {
          await invoke("windows_set_start_menu_replacement", { enabled: newConfig.replaceNativeStartButton });
        }
      } catch (e) {
        console.warn("Falha ao aplicar configurações de Start Menu:", e);
      }

      get().showNotification(`🚀 ${title}`);
    },

    updateTaskbar: async (newConfig, title = "Barra de Tarefas Atualizada") => {
      const prev = get().taskbar;
      const updated = { ...prev, ...newConfig };
      undoService.recordChange("taskbar", title, "Alinhamento e relógio da barra", prev, updated, true);
      set({ taskbar: updated });

      try {
        await invoke("windows_apply_taskbar_config", {
          alignment: updated.alignment,
          showSeconds: updated.showSecondsInClock,
          searchVisible: updated.showSearch,
        });
      } catch (e) {
        console.warn("Falha na chamada nativa da barra:", e);
      }
      get().showNotification(`📌 ${title}`);
    },

    updateExplorer: async (newConfig, title = "Explorer Atualizado") => {
      const prev = get().explorer;
      const updated = { ...prev, ...newConfig };
      undoService.recordChange("explorer", title, "Configurações de pastas e arquivos", prev, updated, true);
      set({ explorer: updated });

      try {
        await invoke("windows_apply_explorer_config", {
          compactView: updated.compactView,
          showExtensions: updated.showFileExtensions,
          showHidden: updated.showHiddenFiles,
        });
      } catch (e) {
        console.warn("Falha na chamada nativa do explorer:", e);
      }
      get().showNotification(`📁 ${title}`);
    },

    updateWallpaper: async (newConfig, title = "Papel de Parede Alterado") => {
      const prev = get().wallpaper;
      const updated = { ...prev, ...newConfig };
      undoService.recordChange("wallpapers", title, "Papel de parede aplicado", prev, updated, false);
      set({ wallpaper: updated });

      if (updated.wallpaperPath && !updated.isLive) {
        try {
          await invoke("windows_set_desktop_wallpaper", { pathOrUrl: updated.wallpaperPath });
        } catch (e) {
          console.warn("Falha ao definir wallpaper nativo:", e);
        }
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

    // Executa a reversão restaurando o estado exato no Windows
    undoSpecificChange: async (changeId: string) => {
      const success = await undoService.undoChange(changeId, async (cat, prevState) => {
        switch (cat) {
          case "quick":
            if (prevState.appearance) {
              set({ appearance: prevState.appearance });
              try {
                await invoke("windows_apply_theme_mode", { mode: prevState.appearance.mode });
                await invoke("windows_apply_accent_color", { hexColor: prevState.appearance.accentColor });
              } catch {}
            }
            if (prevState.taskbar) {
              set({ taskbar: prevState.taskbar });
              try {
                await invoke("windows_apply_taskbar_config", {
                  alignment: prevState.taskbar.alignment,
                  showSeconds: prevState.taskbar.showSecondsInClock,
                  searchVisible: prevState.taskbar.showSearch,
                });
              } catch {}
            }
            if (prevState.wallpaper && prevState.wallpaper.wallpaperPath) {
              set({ wallpaper: prevState.wallpaper });
              try {
                await invoke("windows_set_desktop_wallpaper", { pathOrUrl: prevState.wallpaper.wallpaperPath });
              } catch {}
            }
            break;

          case "appearance":
            set({ appearance: prevState });
            try {
              if (prevState.mode) await invoke("windows_apply_theme_mode", { mode: prevState.mode });
              if (prevState.accentColor) await invoke("windows_apply_accent_color", { hexColor: prevState.accentColor });
            } catch {}
            break;

          case "start_menu":
            set({ startMenu: prevState });
            break;

          case "taskbar":
            set({ taskbar: prevState });
            try {
              await invoke("windows_apply_taskbar_config", {
                alignment: prevState.alignment,
                showSeconds: prevState.showSecondsInClock,
                searchVisible: prevState.showSearch,
              });
            } catch {}
            break;

          case "explorer":
            set({ explorer: prevState });
            try {
              await invoke("windows_apply_explorer_config", {
                compactView: prevState.compactView,
                showExtensions: prevState.showFileExtensions,
                showHidden: prevState.showHiddenFiles,
              });
            } catch {}
            break;

          case "wallpapers":
            set({ wallpaper: prevState });
            if (prevState.wallpaperPath) {
              try {
                await invoke("windows_set_desktop_wallpaper", { pathOrUrl: prevState.wallpaperPath });
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
        get().showNotification("↩️ Alteração desfeita com sucesso no Windows!");
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
          try {
            await invoke("windows_apply_theme_mode", { mode: "dark" });
            await invoke("windows_apply_accent_color", { hexColor: "#0078d4" });
          } catch {}
          get().updateAppearance(DEFAULT_APPEARANCE, "Restaurado Aparência Original");
          break;
        case "start_menu":
          get().updateStartMenu(DEFAULT_START_MENU, "Restaurado Start Menu Original");
          break;
        case "taskbar":
          try {
            await invoke("windows_apply_taskbar_config", {
              alignment: "center",
              showSeconds: true,
              searchVisible: true,
            });
          } catch {}
          get().updateTaskbar(DEFAULT_TASKBAR, "Restaurado Barra de Tarefas Original");
          break;
        case "explorer":
          try {
            await invoke("windows_apply_explorer_config", {
              compactView: false,
              showExtensions: true,
              showHidden: false,
            });
          } catch {}
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
        await invoke("windows_apply_theme_mode", { mode: "dark" });
        await invoke("windows_apply_accent_color", { hexColor: "#0078d4" });
        await invoke("windows_apply_taskbar_config", { alignment: "center", showSeconds: true, searchVisible: true });
        await invoke("windows_apply_explorer_config", { compactView: false, showExtensions: true, showHidden: false });
        await invoke("windows_restore_default_wallpaper");
      } catch (e) {
        console.warn("Erro ao restaurar defaults nativos:", e);
      }

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

      get().showNotification("🛡️ Emergency Recovery: Todo o Windows foi restaurado aos padrões seguros!");
    },
  };
});
