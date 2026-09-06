import { create } from "zustand";
import { CrosshairItem, CrosshairLayer, ClassicCrosshairLayer } from "../types";
import { PROCEDURAL_PRESETS } from "../engine/procedural-presets";

interface CrosshairStoreState {
  activeCrosshair: CrosshairItem;
  savedCrosshairs: CrosshairItem[];
  history: CrosshairItem[];
  favorites: string[];
  undoStack: CrosshairItem[];
  redoStack: CrosshairItem[];
  isOverlayActive: boolean;
  selectedMonitorIndex: number;
  overlayOffsetX: number;
  overlayOffsetY: number;
  previewBackground: string;

  // Actions
  setActiveCrosshair: (crosshair: CrosshairItem) => void;
  updateActiveCrosshair: (updater: (prev: CrosshairItem) => CrosshairItem) => void;
  updateClassicConfig: (patch: Partial<ClassicCrosshairLayer>) => void;
  addLayer: (layer: CrosshairLayer) => void;
  updateLayer: (layerId: string, patch: Partial<CrosshairLayer>) => void;
  removeLayer: (layerId: string) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  toggleFavorite: (id: string) => void;
  saveCurrentCrosshair: () => void;
  deleteCrosshair: (id: string) => void;
  undo: () => void;
  redo: () => void;
  setOverlayActive: (active: boolean) => void;
  setMonitorIndex: (idx: number) => void;
  setOverlayOffset: (x: number, y: number) => void;
  setPreviewBackground: (bg: string) => void;
}

const STORAGE_KEY_SAVED = "pmm_crosshairs_saved";
const STORAGE_KEY_ACTIVE = "pmm_crosshair_active";
const STORAGE_KEY_FAVS = "pmm_crosshair_favs";

function notifyCrosshairChange(crosshair: CrosshairItem) {
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(crosshair));
    } catch {}
  }
  // Broadcast to Tauri multi-window overlay
  import("@tauri-apps/api/event")
    .then(({ emit }) => {
      emit("crosshair-data-updated", crosshair).catch(() => {});
    })
    .catch(() => {});
}

function notifyOffsetsChange(x: number, y: number) {
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem("pmm_overlay_offset_x", String(x));
      localStorage.setItem("pmm_overlay_offset_y", String(y));
    } catch {}
  }
  import("@tauri-apps/api/event")
    .then(({ emit }) => {
      emit("overlay-offsets-updated", { x, y }).catch(() => {});
    })
    .catch(() => {});
}

function loadInitial(): {
  active: CrosshairItem;
  saved: CrosshairItem[];
  favs: string[];
} {
  // Cute Heart 💕 is the true flagship default crosshair for the wife!
  const defaultItem = PROCEDURAL_PRESETS[4];
  try {
    const rawSaved = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY_SAVED) : null;
    const rawActive = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY_ACTIVE) : null;
    const rawFavs = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY_FAVS) : null;

    const saved = rawSaved ? JSON.parse(rawSaved) : [];
    const active = rawActive ? JSON.parse(rawActive) : defaultItem;
    const favs = rawFavs ? JSON.parse(rawFavs) : [defaultItem.id, PROCEDURAL_PRESETS[6].id];

    return { active, saved, favs };
  } catch {
    return { active: defaultItem, saved: [], favs: [] };
  }
}

const initial = loadInitial();

export const useCrosshairStore = create<CrosshairStoreState>((set, get) => ({
  activeCrosshair: initial.active,
  savedCrosshairs: initial.saved,
  history: [initial.active],
  favorites: initial.favs,
  undoStack: [],
  redoStack: [],
  isOverlayActive: false,
  selectedMonitorIndex: 0,
  overlayOffsetX: typeof localStorage !== "undefined" ? parseInt(localStorage.getItem("pmm_overlay_offset_x") || "0", 10) : 0,
  overlayOffsetY: typeof localStorage !== "undefined" ? parseInt(localStorage.getItem("pmm_overlay_offset_y") || "0", 10) : 0,
  previewBackground: "#111827",

  setActiveCrosshair: (crosshair) => {
    const current = get().activeCrosshair;
    const history = [crosshair, ...get().history.filter((h) => h.id !== crosshair.id)].slice(0, 20);

    notifyCrosshairChange(crosshair);
    set({
      activeCrosshair: crosshair,
      history,
      undoStack: [JSON.parse(JSON.stringify(current)), ...get().undoStack].slice(0, 30),
      redoStack: [],
    });
  },

  updateActiveCrosshair: (updater) => {
    const prev = get().activeCrosshair;
    const next = updater(prev);
    notifyCrosshairChange(next);
    set({
      activeCrosshair: next,
      undoStack: [JSON.parse(JSON.stringify(prev)), ...get().undoStack].slice(0, 30),
      redoStack: [],
    });
  },

  updateClassicConfig: (patch) => {
    const current = get().activeCrosshair;
    const baseConfig = current.classicConfig || {
      id: `classic-${Date.now()}`,
      name: "Linhas Clássicas",
      type: "classic" as const,
      visible: true,
      locked: false,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      color: current.layers[0]?.color || "#ff69b4",
      opacity: 1,
      size: 6,
      thickness: 2,
      gap: 3,
      dot: false,
      dotSize: 2,
      outline: true,
      outlineThickness: 1,
      outlineColor: "#000000",
      showTop: true,
      showBottom: true,
      showLeft: true,
      showRight: true,
      tStyle: false,
      rounded: false,
    };

    const prevSnapshot = JSON.parse(JSON.stringify(current));
    const nextConfig = { ...baseConfig, ...patch };
    const next = { ...current, classicConfig: nextConfig, updatedAt: new Date().toISOString() };

    notifyCrosshairChange(next);
    set({
      activeCrosshair: next,
      undoStack: [prevSnapshot, ...get().undoStack].slice(0, 30),
      redoStack: [],
    });
  },


  addLayer: (layer) => {
    const current = get().activeCrosshair;
    const prevSnapshot = JSON.parse(JSON.stringify(current));
    const nextLayers = [...current.layers, layer];
    const next: CrosshairItem = {
      ...current,
      type: "layered",
      layers: nextLayers,
      updatedAt: new Date().toISOString(),
    };

    notifyCrosshairChange(next);
    set({
      activeCrosshair: next,
      undoStack: [prevSnapshot, ...get().undoStack].slice(0, 30),
      redoStack: [],
    });
  },

  updateLayer: (layerId, patch) => {
    const current = get().activeCrosshair;
    const prevSnapshot = JSON.parse(JSON.stringify(current));
    const nextLayers = current.layers.map((l) =>
      l.id === layerId ? ({ ...l, ...patch } as CrosshairLayer) : l
    );
    const next: CrosshairItem = {
      ...current,
      layers: nextLayers,
      updatedAt: new Date().toISOString(),
    };

    notifyCrosshairChange(next);
    set({
      activeCrosshair: next,
      undoStack: [prevSnapshot, ...get().undoStack].slice(0, 30),
      redoStack: [],
    });
  },

  removeLayer: (layerId) => {
    const current = get().activeCrosshair;
    const prevSnapshot = JSON.parse(JSON.stringify(current));
    const nextLayers = current.layers.filter((l) => l.id !== layerId);
    const next: CrosshairItem = {
      ...current,
      layers: nextLayers,
      updatedAt: new Date().toISOString(),
    };

    notifyCrosshairChange(next);
    set({
      activeCrosshair: next,
      undoStack: [prevSnapshot, ...get().undoStack].slice(0, 30),
      redoStack: [],
    });
  },

  reorderLayers: (fromIndex, toIndex) => {
    const current = get().activeCrosshair;
    const prevSnapshot = JSON.parse(JSON.stringify(current));
    const nextLayers = [...current.layers];
    const [moved] = nextLayers.splice(fromIndex, 1);
    nextLayers.splice(toIndex, 0, moved);

    const next = { ...current, layers: nextLayers };
    notifyCrosshairChange(next);
    set({
      activeCrosshair: next,
      undoStack: [prevSnapshot, ...get().undoStack].slice(0, 30),
      redoStack: [],
    });
  },

  toggleFavorite: (id) => {
    const currentFavs = get().favorites;
    const exists = currentFavs.includes(id);
    const nextFavs = exists ? currentFavs.filter((f) => f !== id) : [...currentFavs, id];

    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(nextFavs));
    }
    set({ favorites: nextFavs });
  },

  saveCurrentCrosshair: () => {
    const active = get().activeCrosshair;
    const saved = get().savedCrosshairs;
    const existingIndex = saved.findIndex((s) => s.id === active.id);

    let nextSaved: CrosshairItem[];
    if (existingIndex >= 0) {
      nextSaved = [...saved];
      nextSaved[existingIndex] = { ...active, updatedAt: new Date().toISOString() };
    } else {
      nextSaved = [
        {
          ...active,
          id: `custom-${Date.now()}`,
          category: "Custom",
          author: "Esposa",
          updatedAt: new Date().toISOString(),
        },
        ...saved,
      ];
    }

    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(nextSaved));
    }
    set({ savedCrosshairs: nextSaved });
  },

  deleteCrosshair: (id) => {
    const saved = get().savedCrosshairs.filter((s) => s.id !== id);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(saved));
    }
    set({ savedCrosshairs: saved });
  },

  undo: () => {
    const undoStack = get().undoStack;
    if (undoStack.length === 0) return;

    const [previous, ...rest] = undoStack;
    const current = get().activeCrosshair;

    notifyCrosshairChange(previous);
    set({
      activeCrosshair: previous,
      undoStack: rest,
      redoStack: [JSON.parse(JSON.stringify(current)), ...get().redoStack].slice(0, 30),
    });
  },

  redo: () => {
    const redoStack = get().redoStack;
    if (redoStack.length === 0) return;

    const [next, ...rest] = redoStack;
    const current = get().activeCrosshair;

    notifyCrosshairChange(next);
    set({
      activeCrosshair: next,
      redoStack: rest,
      undoStack: [JSON.parse(JSON.stringify(current)), ...get().undoStack].slice(0, 30),
    });
  },

  setOverlayActive: (active) => set({ isOverlayActive: active }),
  setMonitorIndex: (idx) => set({ selectedMonitorIndex: idx }),
  setOverlayOffset: (x, y) => {
    notifyOffsetsChange(x, y);
    set({ overlayOffsetX: x, overlayOffsetY: y });
  },
  setPreviewBackground: (bg) => set({ previewBackground: bg }),
}));
