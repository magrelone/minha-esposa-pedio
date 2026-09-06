import React from "react";
import {
  Crosshair,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  Clock,
  Layers,
  Sparkles,
  MousePointer,
} from "lucide-react";
import { useAutoClickStore } from "../store/autoclickStore";
import { ClickPoint, MouseButton, ClickType } from "../types";

export const MultiPointView: React.FC<{ onPickPoint: (pointId: string) => void }> = ({
  onPickPoint,
}) => {
  const { multiPoints, addPoint, updatePoint, removePoint, reorderPoints } = useAutoClickStore();

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...multiPoints];
    const temp = items[index - 1];
    items[index - 1] = items[index];
    items[index] = temp;
    reorderPoints(items);
  };

  const handleMoveDown = (index: number) => {
    if (index === multiPoints.length - 1) return;
    const items = [...multiPoints];
    const temp = items[index + 1];
    items[index + 1] = items[index];
    items[index] = temp;
    reorderPoints(items);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center text-2xl shadow-soft">
            <Crosshair size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-theme-text">Múltiplos Pontos (Multi-Point Clicker)</h2>
            <span className="text-xs text-theme-text-muted">
              Configure uma sequência de cliques em diferentes coordenadas com tempos independentes
            </span>
          </div>
        </div>

        <button
          onClick={() =>
            addPoint({
              name: `Ponto ${multiPoints.length + 1}`,
              x: 500,
              y: 400,
              monitorIndex: 0,
              button: "left",
              clickType: "single",
              delayBeforeMs: 100,
              delayAfterMs: 200,
              repeatTimes: 1,
              enabled: true,
            })
          }
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-theme-primary hover:bg-theme-primary/90 text-xs font-bold text-white shadow-soft transition-all"
        >
          <Plus size={14} />
          <span>Adicionar Ponto</span>
        </button>
      </div>

      {/* Points List */}
      <div className="flex flex-col gap-3">
        {multiPoints.map((pt, index) => (
          <div
            key={pt.id}
            className={`p-5 rounded-3xl bg-theme-surface border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              pt.enabled ? "border-theme-border/60 shadow-soft" : "border-theme-border/30 opacity-60"
            }`}
          >
            {/* Number badge & Coordinates */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-500/15 text-pink-500 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                #{index + 1}
              </div>

              <div className="flex flex-col">
                <input
                  type="text"
                  value={pt.name}
                  onChange={(e) => updatePoint(pt.id, { name: e.target.value })}
                  className="text-xs font-bold text-theme-text bg-transparent border-b border-transparent hover:border-theme-border/60 focus:outline-none focus:border-pink-500"
                />
                <div className="flex items-center gap-2 text-[11px] font-mono text-theme-text-muted mt-0.5">
                  <span>X: {pt.x}</span>
                  <span>Y: {pt.y}</span>
                  <span>•</span>
                  <span>Monitor #{pt.monitorIndex + 1}</span>
                </div>
              </div>
            </div>

            {/* Quick Button / Delays / Repeat config */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Button */}
              <select
                value={pt.button}
                onChange={(e) => updatePoint(pt.id, { button: e.target.value as MouseButton })}
                className="px-2.5 py-1.5 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs font-bold text-theme-text focus:outline-none"
              >
                <option value="left">Esquerdo</option>
                <option value="right">Direito</option>
                <option value="middle">Meio</option>
              </select>

              {/* Click type */}
              <select
                value={pt.clickType}
                onChange={(e) => updatePoint(pt.id, { clickType: e.target.value as ClickType })}
                className="px-2.5 py-1.5 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs font-bold text-theme-text focus:outline-none"
              >
                <option value="single">Único</option>
                <option value="double">Duplo</option>
                <option value="triple">Triplo</option>
                <option value="hold">Segurar</option>
              </select>

              {/* Delay before / after */}
              <div className="flex items-center gap-1 bg-theme-surface-card px-2 py-1 rounded-xl border border-theme-border/40 text-[11px] font-mono">
                <Clock size={11} className="text-theme-text-muted" />
                <span>Antes:</span>
                <input
                  type="number"
                  min="0"
                  value={pt.delayBeforeMs}
                  onChange={(e) => updatePoint(pt.id, { delayBeforeMs: parseInt(e.target.value) || 0 })}
                  className="w-12 text-center bg-transparent focus:outline-none font-bold text-pink-500"
                />
                <span>ms</span>
              </div>

              <div className="flex items-center gap-1 bg-theme-surface-card px-2 py-1 rounded-xl border border-theme-border/40 text-[11px] font-mono">
                <Clock size={11} className="text-theme-text-muted" />
                <span>Depois:</span>
                <input
                  type="number"
                  min="0"
                  value={pt.delayAfterMs}
                  onChange={(e) => updatePoint(pt.id, { delayAfterMs: parseInt(e.target.value) || 0 })}
                  className="w-12 text-center bg-transparent focus:outline-none font-bold text-pink-500"
                />
                <span>ms</span>
              </div>

              {/* Position Pick button */}
              <button
                onClick={() => onPickPoint(pt.id)}
                title="Capturar coordenada na tela"
                className="p-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/20"
              >
                <Crosshair size={14} />
              </button>
            </div>

            {/* Actions: Move Up / Down, Toggle, Delete */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="p-1.5 rounded-xl hover:bg-theme-surface-card text-theme-text-muted disabled:opacity-30"
              >
                <ArrowUp size={14} />
              </button>

              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === multiPoints.length - 1}
                className="p-1.5 rounded-xl hover:bg-theme-surface-card text-theme-text-muted disabled:opacity-30"
              >
                <ArrowDown size={14} />
              </button>

              <button
                onClick={() => updatePoint(pt.id, { enabled: !pt.enabled })}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors ${
                  pt.enabled ? "bg-emerald-500/15 text-emerald-600" : "bg-neutral-500/15 text-neutral-500"
                }`}
              >
                {pt.enabled ? "Ativo" : "Inativo"}
              </button>

              <button
                onClick={() => removePoint(pt.id)}
                className="p-1.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors"
                title="Remover ponto"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
