import React, { useState } from "react";
import {
  Keyboard,
  Plus,
  Trash2,
  Clock,
  ShieldAlert,
  Play,
  Square,
  Sparkles,
  Layers,
} from "lucide-react";
import { useAutoClickStore } from "../store/autoclickStore";
import { KeyClickerConfig } from "../types";

export const KeyClickerView: React.FC = () => {
  const { keyClickers, addKeyClicker, removeKeyClicker, startAutoClick, stopAutoClick, isRunning } =
    useAutoClickStore();

  const [newKey, setNewKey] = useState("E");
  const [newInterval, setNewInterval] = useState(500);
  const [newHoldMode, setNewHoldMode] = useState<"press" | "hold">("press");
  const [shiftMod, setShiftMod] = useState(false);
  const [ctrlMod, setCtrlMod] = useState(false);

  const handleAdd = () => {
    addKeyClicker({
      key: newKey.toUpperCase(),
      modifiers: { ctrl: ctrlMod, shift: shiftMod, alt: false },
      intervalMs: newInterval,
      holdMode: newHoldMode,
      holdDurationSeconds: 1,
      enabled: true,
    });
    setNewKey("");
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center text-2xl shadow-soft">
            <Keyboard size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-theme-text">Automação de Teclado (Key Clicker & Holder)</h2>
            <span className="text-xs text-theme-text-muted">
              Pressione ou segure teclas repetidamente (ex.: E a cada 500ms, Shift + W) com liberação segura garantida
            </span>
          </div>
        </div>

        <button
          onClick={() => (isRunning ? stopAutoClick() : startAutoClick())}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-soft transition-all ${
            isRunning ? "bg-neutral-800 hover:bg-neutral-900" : "bg-theme-primary hover:bg-theme-primary/90"
          }`}
        >
          {isRunning ? <Square size={14} className="fill-white" /> : <Play size={14} className="fill-white" />}
          <span>{isRunning ? "Parar Teclas" : "Iniciar Teclas"}</span>
        </button>
      </div>

      {/* Add New Key Config Card */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-4">
        <span className="text-xs font-black text-theme-text uppercase">Adicionar Tecla Automatizada</span>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Key Input */}
          <div className="flex flex-col gap-1">
            <label className="text-theme-text-muted font-bold text-[10px]">Tecla Principal</label>
            <input
              type="text"
              placeholder="Ex: E, W, Espaço"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value.toUpperCase())}
              className="p-2.5 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs font-mono font-bold text-theme-text focus:outline-none"
            />
          </div>

          {/* Mode */}
          <div className="flex flex-col gap-1">
            <label className="text-theme-text-muted font-bold text-[10px]">Comportamento</label>
            <select
              value={newHoldMode}
              onChange={(e) => setNewHoldMode(e.target.value as "press" | "hold")}
              className="p-2.5 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs font-bold text-theme-text focus:outline-none"
            >
              <option value="press">Pressionar & Soltar</option>
              <option value="hold">Segurar Contínuo (Hold)</option>
            </select>
          </div>

          {/* Interval */}
          <div className="flex flex-col gap-1">
            <label className="text-theme-text-muted font-bold text-[10px]">Intervalo (ms)</label>
            <input
              type="number"
              min="10"
              value={newInterval}
              onChange={(e) => setNewInterval(parseInt(e.target.value) || 100)}
              className="p-2.5 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs font-mono font-bold text-pink-500 focus:outline-none"
            />
          </div>

          {/* Add Button */}
          <div className="flex flex-col justify-end">
            <button
              onClick={handleAdd}
              disabled={!newKey.trim()}
              className="w-full py-2.5 rounded-xl bg-theme-primary hover:bg-theme-primary/90 text-xs font-bold text-white shadow-soft transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Plus size={14} />
              <span>Adicionar</span>
            </button>
          </div>
        </div>

        {/* Modifiers */}
        <div className="flex items-center gap-4 text-xs pt-1">
          <span className="text-theme-text-muted font-bold text-[10px]">Modificadores Opcionais:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={shiftMod}
              onChange={(e) => setShiftMod(e.target.checked)}
              className="rounded accent-pink-500 w-3.5 h-3.5"
            />
            <span className="font-bold text-theme-text">Shift</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={ctrlMod}
              onChange={(e) => setCtrlMod(e.target.checked)}
              className="rounded accent-pink-500 w-3.5 h-3.5"
            />
            <span className="font-bold text-theme-text">Control</span>
          </label>
        </div>
      </div>

      {/* Active Key List */}
      <div className="flex flex-col gap-3">
        {keyClickers.map((kc, idx) => (
          <div
            key={idx}
            className="p-4 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-2xl bg-theme-surface-card border border-theme-border/60 font-mono font-black text-sm text-theme-text shadow-inner">
                {kc.modifiers.ctrl ? "Ctrl + " : ""}
                {kc.modifiers.shift ? "Shift + " : ""}
                {kc.key}
              </div>

              <div className="flex flex-col text-xs">
                <span className="font-bold text-theme-text">
                  {kc.holdMode === "hold" ? "Segurar Tecla" : "Pressionar Repetidamente"}
                </span>
                <span className="text-[10px] font-mono text-theme-text-muted">
                  Intervalo: {kc.intervalMs}ms ({Math.round(1000 / kc.intervalMs)} vezes/seg)
                </span>
              </div>
            </div>

            <button
              onClick={() => removeKeyClicker(idx)}
              className="p-2 rounded-xl text-theme-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Remover tecla"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
