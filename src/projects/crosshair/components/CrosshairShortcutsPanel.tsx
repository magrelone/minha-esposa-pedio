import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Keyboard, Gamepad2, Sparkles, ShieldCheck } from "lucide-react";
import { useToast } from "@/core/components/Toast";

const POPULAR_OVERLAY_KEYS = [
  "F10",
  "F9",
  "F8",
  "F7",
  "F6",
  "F11",
  "F12",
  "Insert",
  "Delete",
  "Control+Alt+X",
];

const POPULAR_APP_KEYS = [
  "Control+H",
  "Control+Alt+C",
  "F11",
];

export const CrosshairShortcutsPanel: React.FC = () => {
  const { addToast } = useToast();
  const [overlayKey, setOverlayKey] = useState("F10");
  const [appKey, setAppKey] = useState("Control+H");
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      const savedOverlay = localStorage.getItem("pmm_hotkey_overlay");
      const savedApp = localStorage.getItem("pmm_hotkey_app");
      if (savedOverlay) setOverlayKey(savedOverlay);
      if (savedApp) setAppKey(savedApp);
    }
  }, []);

  const handleSetOverlayKey = async (newKey: string) => {
    setOverlayKey(newKey);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("pmm_hotkey_overlay", newKey);
    }
    try {
      await invoke("register_custom_hotkey", { key: newKey });
    } catch {}
    addToast(`Atalho da mira definido para ${newKey}! 🎯`, "sparkle");
  };

  const handleSetAppKey = (newKey: string) => {
    setAppKey(newKey);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("pmm_hotkey_app", newKey);
    }
    addToast(`Atalho da central definido para ${newKey}! 🪟`, "info");
  };

  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      let key = e.key.toUpperCase();
      if (e.key.startsWith("F") && e.key.length <= 3) {
        key = e.key.toUpperCase();
      } else if (e.key === "Insert") {
        key = "Insert";
      } else if (e.key === "Delete") {
        key = "Delete";
      } else if (e.ctrlKey && e.altKey) {
        key = `Control+Alt+${e.key.toUpperCase()}`;
      } else if (e.ctrlKey) {
        key = `Control+${e.key.toUpperCase()}`;
      }

      handleSetOverlayKey(key);
      setIsRecording(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRecording]);

  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-theme-border/60 pb-3">
        <div className="p-2 rounded-xl bg-pink-100 text-pink-500">
          <Keyboard size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-theme-text">Atalhos Globais do Crosshair</h3>
          <p className="text-xs text-theme-text-muted">
            Configure suas teclas rápidas para usar dentro dos jogos
          </p>
        </div>
      </div>

      {/* Global Windows Status Banner */}
      <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 font-medium">
        <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
        <span>
          <b>Atalhos Globais do Windows Ativos:</b> Funcionam com qualquer jogo em tela cheia (CS2, Valorant, Rust, etc.) sem precisar minimizar!
        </span>
      </div>

      {/* 1. Overlay Hotkey */}
      <div className="flex flex-col gap-2.5 bg-theme-surface-card p-4 rounded-2xl border border-theme-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 size={16} className="text-theme-primary" />
            <span className="text-xs font-bold text-theme-text">
              Ligar / Desligar Mira na Tela:
            </span>
          </div>
          <kbd className="px-3 py-1 bg-theme-primary text-white rounded-lg font-mono text-xs font-bold shadow-soft">
            {overlayKey}
          </kbd>
        </div>

        <div className="flex items-center gap-2 pt-1 flex-wrap">
          {POPULAR_OVERLAY_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => handleSetOverlayKey(k)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                overlayKey === k
                  ? "bg-theme-primary text-white border-theme-primary shadow-soft"
                  : "bg-theme-surface border-theme-border/60 text-theme-text hover:border-theme-primary"
              }`}
            >
              {k}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setIsRecording(true)}
            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
              isRecording
                ? "bg-rose-500 text-white border-rose-500 animate-pulse"
                : "bg-theme-surface-card border-dashed border-theme-primary text-theme-primary hover:bg-theme-surface"
            }`}
          >
            {isRecording ? "Pressione a tecla..." : "+ Gravar Tecla"}
          </button>
        </div>
      </div>

      {/* 2. App Hotkey */}
      <div className="flex flex-col gap-2.5 bg-theme-surface-card p-4 rounded-2xl border border-theme-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-500" />
            <span className="text-xs font-bold text-theme-text">
              Ocultar / Restaurar a Central na Bandeja:
            </span>
          </div>
          <kbd className="px-3 py-1 bg-theme-surface border border-theme-border text-theme-text rounded-lg font-mono text-xs font-bold">
            {appKey}
          </kbd>
        </div>

        <div className="flex items-center gap-2 pt-1 flex-wrap">
          {POPULAR_APP_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => handleSetAppKey(k)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                appKey === k
                  ? "bg-purple-600 text-white border-purple-600 shadow-soft"
                  : "bg-theme-surface border-theme-border/60 text-theme-text hover:border-purple-500"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Studio Shortcuts */}
      <div className="flex flex-col gap-2 pt-1">
        <span className="text-xs font-bold text-theme-text">Outros Atalhos Práticos:</span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-theme-surface-card border border-theme-border/50 flex items-center justify-between">
            <span className="text-theme-text">Salvar Mira Atual</span>
            <kbd className="font-mono text-theme-primary font-bold">Ctrl + S</kbd>
          </div>
          <div className="p-2.5 rounded-xl bg-theme-surface-card border border-theme-border/50 flex items-center justify-between">
            <span className="text-theme-text">Desfazer Alteração</span>
            <kbd className="font-mono text-theme-primary font-bold">Ctrl + Z</kbd>
          </div>
          <div className="p-2.5 rounded-xl bg-theme-surface-card border border-theme-border/50 flex items-center justify-between">
            <span className="text-theme-text">Refazer Alteração</span>
            <kbd className="font-mono text-theme-primary font-bold">Ctrl + Y</kbd>
          </div>
          <div className="p-2.5 rounded-xl bg-theme-surface-card border border-theme-border/50 flex items-center justify-between">
            <span className="text-theme-text">Alternar Tela Cheia</span>
            <kbd className="font-mono text-theme-primary font-bold">F11</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
