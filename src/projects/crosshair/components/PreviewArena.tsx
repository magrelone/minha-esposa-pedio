import React, { useState } from "react";
import { useCrosshairStore } from "../store/crosshairStore";
import { ContrastChecker } from "../engine/contrast-checker";
import { VectorCrosshair } from "./VectorCrosshair";
import { Button } from "@/core/components/Button";
import { Slider } from "@/core/components/Slider";
import {
  ZoomIn,
  ZoomOut,
  ShieldAlert,
  Sparkles,
  Play,
  Pause,
  Palette,
  Minus,
  Plus,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/core/components/Toast";

const QUICK_COLORS = [
  { name: "Hot Pink", hex: "#ff69b4", emoji: "💗" },
  { name: "Sakura", hex: "#ffccd5", emoji: "🌸" },
  { name: "Lilás", hex: "#c084fc", emoji: "💜" },
  { name: "Céu Claro", hex: "#7dd3fc", emoji: "🩵" },
  { name: "Menta", hex: "#6ee7b7", emoji: "🍵" },
  { name: "Limão", hex: "#fef08a", emoji: "🍋" },
  { name: "Verde Gamer", hex: "#00ff66", emoji: "🟢" },
  { name: "Branco Puro", hex: "#ffffff", emoji: "🤍" },
];

const SOLID_BACKGROUNDS = [
  { id: "black", label: "Preto", color: "#000000" },
  { id: "white", label: "Branco", color: "#ffffff" },
  { id: "gray", label: "Cinza", color: "#4b5563" },
  { id: "red", label: "Vermelho", color: "#dc2626" },
  { id: "green", label: "Verde", color: "#16a34a" },
  { id: "blue", label: "Azul", color: "#2563eb" },
];

const SIMULATED_SCENARIOS = [
  {
    id: "tactical-night",
    label: "Noite Escura",
    css: "linear-gradient(135deg, #090d16 0%, #171d2c 50%, #0b0f19 100%)",
  },
  {
    id: "sunny-sky",
    label: "Céu Ensolarado",
    css: "linear-gradient(180deg, #38bdf8 0%, #93c5fd 60%, #e0f2fe 100%)",
  },
  {
    id: "vegetation",
    label: "Selva / Grama",
    css: "linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 100%)",
  },
  {
    id: "urban-concrete",
    label: "Concreto / Cidade",
    css: "linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)",
  },
  {
    id: "desert-dust",
    label: "Deserto / Poeira",
    css: "linear-gradient(135deg, #78350f 0%, #92400e 40%, #b45309 100%)",
  },
];

export const PreviewArena: React.FC = () => {
  const {
    activeCrosshair,
    updateActiveCrosshair,
    updateClassicConfig,
    isOverlayActive,
    setOverlayActive,
    overlayOffsetX,
    overlayOffsetY,
    setOverlayOffset,
  } = useCrosshairStore();

  const { addToast } = useToast();
  const [zoom, setZoom] = useState(2);
  const [activeBg, setActiveBg] = useState(SIMULATED_SCENARIOS[0].css);
  const [showContrastModal, setShowContrastModal] = useState(false);
  const [showOffsetModal, setShowOffsetModal] = useState(false);

  const crosshairColor =
    activeCrosshair.classicConfig?.color ||
    activeCrosshair.layers[0]?.color ||
    "#ff69b4";

  const contrastResults = ContrastChecker.evaluateColor(crosshairColor);

  const handleApplyQuickColor = (color: string, name: string) => {
    if (activeCrosshair.classicConfig) {
      updateClassicConfig({ color });
    }
    if (activeCrosshair.layers.length > 0) {
      updateActiveCrosshair((prev) => ({
        ...prev,
        layers: prev.layers.map((l) => ({ ...l, color })),
      }));
    }
    addToast(`Cor trocada para ${name}! ✨`, "sparkle");
  };

  const handleQuickScale = (delta: number) => {
    updateActiveCrosshair((prev) => {
      if (prev.classicConfig) {
        const nextSize = Math.max(1, Math.min(30, prev.classicConfig.size + delta * 2));
        return {
          ...prev,
          classicConfig: { ...prev.classicConfig, size: nextSize },
        };
      }
      return {
        ...prev,
        layers: prev.layers.map((l) => ({
          ...l,
          scale: Math.max(0.4, Math.min(3, (l.scale || 1) + delta * 0.2)),
        })),
      };
    });
  };

  const handleNudge = (dx: number, dy: number) => {
    setOverlayOffset(overlayOffsetX + dx, overlayOffsetY + dy);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Canvas Viewport */}
      <div
        className="relative flex-1 rounded-cute overflow-hidden border border-theme-border/80 shadow-soft flex items-center justify-center min-h-[360px] transition-all duration-300 select-none"
        style={{ background: activeBg }}
      >
        {/* Subtle grid pattern overlay for simulated 3D depth */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Center Crosshair Vector */}
        <div className="relative z-10 pointer-events-none drop-shadow-md flex items-center justify-center">
          <VectorCrosshair crosshair={activeCrosshair} size={400} scale={zoom} />
        </div>

        {/* Top Left Controls: Zoom & Quick Scale */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-xs">
          <span>Zoom: {zoom}x</span>
          <button
            onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
            className="p-1 hover:bg-white/20 rounded"
            title="Reduzir zoom da pré-visualização"
          >
            <ZoomOut size={13} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(5, z + 0.5))}
            className="p-1 hover:bg-white/20 rounded"
            title="Aumentar zoom da pré-visualização"
          >
            <ZoomIn size={13} />
          </button>
        </div>

        {/* Top Right Controls: Offset Calibration & Contrast */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {/* Quick Recenter Button when offset != 0 */}
          {(overlayOffsetX !== 0 || overlayOffsetY !== 0) && (
            <button
              onClick={() => {
                setOverlayOffset(0, 0);
                addToast("Mira centralizada no centro exato (0, 0)! ✨", "sparkle");
              }}
              className="flex items-center gap-1 bg-pink-500/90 hover:bg-pink-600 text-white backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-pink-300 text-xs font-bold transition-all shadow-soft"
              title="Voltar a mira imediatamente para o centro da tela (0, 0)"
            >
              <RotateCcw size={12} />
              <span>Centralizar (0, 0)</span>
            </button>
          )}

          {/* Calibrate Center / Offset Button */}
          <button
            onClick={() => setShowOffsetModal(!showOffsetModal)}
            className={`flex items-center gap-1.5 backdrop-blur-md px-3 py-1.5 rounded-xl border text-xs transition-all ${
              overlayOffsetX !== 0 || overlayOffsetY !== 0
                ? "bg-pink-600/90 border-pink-400 text-white font-bold shadow-soft"
                : "bg-black/50 hover:bg-black/70 border-white/10 text-white"
            }`}
            title="Calibrar centro para jogos com mira rebaixada ou em terceira pessoa"
          >
            <Move size={13} className={overlayOffsetX !== 0 || overlayOffsetY !== 0 ? "text-pink-200" : "text-pink-400"} />
            <span>Centro ({overlayOffsetX}, {overlayOffsetY})</span>
          </button>


          {/* Contrast Checker Button */}
          <button
            onClick={() => setShowContrastModal(!showContrastModal)}
            className="flex items-center gap-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-xs transition-all"
          >
            <ShieldAlert size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Contraste</span>
          </button>
        </div>

        {/* Center Target Rings (discreet watermark) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 rounded-full border border-white/5" />
          <div className="w-24 h-24 rounded-full border border-white/5 absolute" />
        </div>
      </div>

      {/* Quick Color Palette Bar */}
      <div className="flex items-center justify-between bg-theme-surface px-4 py-2.5 rounded-2xl border border-theme-border/60">
        <div className="flex items-center gap-2">
          <Palette size={15} className="text-theme-primary" />
          <span className="text-xs font-bold text-theme-text">Cores Rápidas:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {QUICK_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => handleApplyQuickColor(c.hex, c.name)}
              title={`${c.emoji} ${c.name} (${c.hex})`}
              className="w-6 h-6 rounded-full border border-black/15 shadow-xs hover:scale-125 active:scale-95 transition-all"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-theme-text-muted font-semibold mr-1">Tamanho:</span>
          <button
            onClick={() => handleQuickScale(-1)}
            className="w-6 h-6 rounded-lg bg-theme-surface-card hover:bg-theme-primary hover:text-white border border-theme-border flex items-center justify-center text-xs transition-all"
            title="Diminuir tamanho da mira"
          >
            <Minus size={12} />
          </button>
          <button
            onClick={() => handleQuickScale(1)}
            className="w-6 h-6 rounded-lg bg-theme-surface-card hover:bg-theme-primary hover:text-white border border-theme-border flex items-center justify-center text-xs transition-all"
            title="Aumentar tamanho da mira"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Calibration / Offset Modal Drawer */}
      {showOffsetModal && (
        <div className="p-4 bg-theme-surface rounded-cute border border-theme-border shadow-float flex flex-col gap-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-theme-border/40 pb-2.5">
            <div className="flex items-center gap-2">
              <Move size={16} className="text-pink-500" />
              <h4 className="text-sm font-bold text-theme-text">
                Calibrar Centro / Offset de Jogos
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOverlayOffset(0, 0)}
                className="text-[11px] text-theme-primary font-bold hover:underline flex items-center gap-1"
              >
                <RotateCcw size={12} />
                <span>Zerar (0, 0)</span>
              </button>
              <button
                onClick={() => setShowOffsetModal(false)}
                className="text-xs text-theme-text-muted hover:text-theme-text ml-2"
              >
                Fechar
              </button>
            </div>
          </div>

          <p className="text-xs text-theme-text-muted">
            Em jogos como <b>Hunt: Showdown, DayZ, Rust</b> ou jogos em <b>3ª pessoa</b>, o ponto de tiro não fica no centro exato da tela. Ajuste aqui em tempo real:
          </p>

          {/* Quick Presets for Games */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "🎯 Centro Exato (0, 0)", x: 0, y: 0 },
              { label: "🌲 Mira Rebaixada (Y: +75px) - Hunt / DayZ / Rust", x: 0, y: 75 },
              { label: "👤 3ª Pessoa Ombro Dir. (X: +140px, Y: +30px)", x: 140, y: 30 },
              { label: "👤 3ª Pessoa Ombro Esq. (X: -140px, Y: +30px)", x: -140, y: 30 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setOverlayOffset(p.x, p.y);
                  addToast(`Preset aplicado: ${p.label}`, "sparkle");
                }}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                  overlayOffsetX === p.x && overlayOffsetY === p.y
                    ? "bg-theme-primary text-white border-theme-primary font-bold shadow-soft"
                    : "bg-theme-surface-card border-theme-border/60 text-theme-text-muted hover:text-theme-text"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* D-Pad Micro Adjustment & Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
            {/* D-Pad */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 rounded-2xl bg-theme-surface-card border border-theme-border/60">
              <span className="text-[10px] uppercase font-bold text-theme-text-muted mb-2">
                Ajuste Fino (Clique ou Teclas)
              </span>
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleNudge(0, -5)}
                  className="p-2 rounded-xl bg-theme-surface hover:bg-theme-primary hover:text-white border border-theme-border shadow-xs transition-all"
                  title="Subir mira 5px"
                >
                  <ArrowUp size={14} />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleNudge(-5, 0)}
                    className="p-2 rounded-xl bg-theme-surface hover:bg-theme-primary hover:text-white border border-theme-border shadow-xs transition-all"
                    title="Mover para esquerda 5px"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-[10px] font-bold">
                    🎯
                  </div>
                  <button
                    onClick={() => handleNudge(5, 0)}
                    className="p-2 rounded-xl bg-theme-surface hover:bg-theme-primary hover:text-white border border-theme-border shadow-xs transition-all"
                    title="Mover para direita 5px"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
                <button
                  onClick={() => handleNudge(0, 5)}
                  className="p-2 rounded-xl bg-theme-surface hover:bg-theme-primary hover:text-white border border-theme-border shadow-xs transition-all"
                  title="Descer mira 5px"
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>

            {/* Direct Sliders and Number Inputs */}
            <div className="sm:col-span-8 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-theme-text">Offset X (Horizontal):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={overlayOffsetX}
                      onChange={(e) => setOverlayOffset(parseInt(e.target.value, 10) || 0, overlayOffsetY)}
                      className="w-16 h-7 text-center font-mono text-xs bg-theme-surface-card border border-theme-border rounded-lg text-theme-text"
                    />
                    <span className="text-theme-text-muted">px</span>
                  </div>
                </div>
                <Slider
                  label=""
                  value={overlayOffsetX}
                  min={-800}
                  max={800}
                  step={1}
                  unit="px"
                  onChange={(x) => setOverlayOffset(x, overlayOffsetY)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-theme-text">Offset Y (Vertical):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={overlayOffsetY}
                      onChange={(e) => setOverlayOffset(overlayOffsetX, parseInt(e.target.value, 10) || 0)}
                      className="w-16 h-7 text-center font-mono text-xs bg-theme-surface-card border border-theme-border rounded-lg text-theme-text"
                    />
                    <span className="text-theme-text-muted">px</span>
                  </div>
                </div>
                <Slider
                  label=""
                  value={overlayOffsetY}
                  min={-800}
                  max={800}
                  step={1}
                  unit="px"
                  onChange={(y) => setOverlayOffset(overlayOffsetX, y)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls: Scenarios & Colors Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-theme-surface p-4 rounded-cute border border-theme-border/60 shadow-soft">
        <div className="flex flex-col gap-1.5 w-full sm:w-auto">
          <span className="text-xs font-semibold text-theme-text-muted">
            Cenários & Fundos de Teste:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SIMULATED_SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => setActiveBg(sc.css)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  activeBg === sc.css
                    ? "border-theme-primary bg-theme-primary/10 text-theme-primary font-medium"
                    : "border-theme-border/40 hover:border-theme-border text-theme-text-muted hover:text-theme-text"
                }`}
              >
                {sc.label}
              </button>
            ))}
            {SOLID_BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setActiveBg(bg.color)}
                className={`w-6 h-6 rounded-lg border shadow-xs transition-transform hover:scale-110 ${
                  activeBg === bg.color
                    ? "ring-2 ring-theme-primary ring-offset-1"
                    : "border-black/20"
                }`}
                style={{ backgroundColor: bg.color }}
                title={bg.label}
              />
            ))}
          </div>
        </div>

        {/* Quick Toggle Overlay Button */}
        <Button
          variant={isOverlayActive ? "danger" : "primary"}
          size="md"
          icon={isOverlayActive ? <Pause size={16} /> : <Play size={16} />}
          onClick={() => setOverlayActive(!isOverlayActive)}
          className="w-full sm:w-auto"
        >
          {isOverlayActive ? "Desativar Mira na Tela" : "Ativar Mira na Tela 🎯"}
        </Button>
      </div>

      {/* Contrast Checker Drawer / Modal */}
      {showContrastModal && (
        <div className="p-4 bg-theme-surface rounded-cute border border-theme-border shadow-float flex flex-col gap-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-theme-text flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-500" />
              Acessibilidade de Visibilidade & Contraste
            </h4>
            <button
              onClick={() => setShowContrastModal(false)}
              className="text-xs text-theme-text-muted hover:text-theme-text"
            >
              Fechar
            </button>
          </div>
          <p className="text-xs text-theme-text-muted">
            Testa a visibilidade da cor da sua mira ({crosshairColor}) contra situações de jogo:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {contrastResults.map((r) => (
              <div
                key={r.bgName}
                className="p-2.5 rounded-xl border border-theme-border/60 flex items-center justify-between text-xs"
                style={{ backgroundColor: r.bgColor }}
              >
                <span className="text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {r.bgName}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                    r.score === "Excelente"
                      ? "bg-emerald-500 text-white"
                      : r.score === "Bom"
                      ? "bg-blue-500 text-white"
                      : r.score === "Atenção"
                      ? "bg-amber-500 text-white"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {r.score} ({r.ratio}:1)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
