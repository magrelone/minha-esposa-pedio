import React from "react";
import { GlowEffectType } from "../types";
import { Slider } from "@/core/components/Slider";
import { ColorPicker } from "@/core/components/ColorPicker";
import { Sparkles, Zap, Heart, RotateCw, Activity, EyeOff } from "lucide-react";

interface GlowAndAnimationControlsProps {
  glow?: boolean;
  glowEffect?: GlowEffectType;
  glowColor?: string;
  glowRadius?: number;
  animationSpeed?: number;
  onChange: (patch: {
    glow?: boolean;
    glowEffect?: GlowEffectType;
    glowColor?: string;
    glowRadius?: number;
    animationSpeed?: number;
  }) => void;
}

const EFFECT_OPTIONS: {
  id: GlowEffectType;
  label: string;
  desc: string;
  icon: React.ReactNode;
  badge?: string;
}[] = [
  {
    id: "none",
    label: "Sem Efeito",
    desc: "Visual padrão nítido",
    icon: <EyeOff size={15} />,
  },
  {
    id: "rgb-chroma",
    label: "Arco-Íris RGB 🌈",
    desc: "Borda croma que muda de cor continuamente",
    icon: <Zap size={15} className="text-pink-400 fill-pink-400" />,
    badge: "RGB",
  },
  {
    id: "neon",
    label: "Brilho Neon 💡",
    desc: "Aura luminosa contínua na cor escolhida",
    icon: <Sparkles size={15} className="text-cyan-400" />,
  },
  {
    id: "pulse-glow",
    label: "Respiração Pulsante 💓",
    desc: "Brilho que respira e pulsa suavemente",
    icon: <Activity size={15} className="text-rose-400" />,
  },
  {
    id: "heartbeat",
    label: "Batimento Cardíaco 💖",
    desc: "Duplo pulso rítmico bem fofinho",
    icon: <Heart size={15} className="text-pink-500 fill-pink-500" />,
  },
  {
    id: "spin",
    label: "Rotação Suave 💫",
    desc: "Giro contínuo e hipnótico",
    icon: <RotateCw size={15} className="text-purple-400" />,
  },
  {
    id: "sparkle",
    label: "Cintilante ✨",
    desc: "Pisca e brilha como estrela",
    icon: <Sparkles size={15} className="text-amber-400 fill-amber-300" />,
  },
];

const QUICK_GLOW_COLORS = [
  { color: "#ff0055", label: "Pink Neon" },
  { color: "#00f0ff", label: "Ciano Cyber" },
  { color: "#ffea00", label: "Dourado" },
  { color: "#00ff88", label: "Menta" },
  { color: "#aa00ff", label: "Roxo" },
  { color: "#ffffff", label: "Branco" },
  { color: "#ff8800", label: "Laranja" },
  { color: "#ff3399", label: "Sakura" },
];

export const GlowAndAnimationControls: React.FC<GlowAndAnimationControlsProps> = ({
  glowEffect = "none",
  glowColor = "#ff69b4",
  glowRadius = 10,
  animationSpeed = 2,
  onChange,
}) => {
  const currentEffect = glowEffect;

  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-theme-surface-card border border-theme-border/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-theme-primary fill-theme-primary/30" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-theme-text">
            Bordas RGB, Glow & Animações ✨
          </h4>
        </div>
        {currentEffect !== "none" && (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-extrabold bg-pink-500 text-white shadow-soft">
            {currentEffect === "rgb-chroma" ? "🌈 RGB Ativo" : "✨ Glow Ativo"}
          </span>
        )}
      </div>

      {/* Grid de Efeitos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {EFFECT_OPTIONS.map((opt) => {
          const isSelected = currentEffect === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange({
                  glowEffect: opt.id,
                  glow: opt.id !== "none",
                });
              }}
              className={`flex flex-col text-left p-2.5 rounded-xl border transition-all relative overflow-hidden ${
                isSelected
                  ? "bg-theme-surface border-theme-primary ring-2 ring-theme-primary/30 shadow-soft"
                  : "bg-theme-surface/50 border-theme-border/60 hover:bg-theme-surface hover:border-theme-border text-theme-text-muted hover:text-theme-text"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="p-1 rounded-lg bg-theme-surface-card border border-theme-border/40">
                  {opt.icon}
                </span>
                {opt.badge && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-red-500 via-green-400 to-blue-500 text-white">
                    {opt.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-theme-text leading-snug">
                {opt.label}
              </span>
              <span className="text-[10px] text-theme-text-muted line-clamp-1 mt-0.5">
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Opções específicas quando há algum efeito ativado */}
      {currentEffect !== "none" && (
        <div className="flex flex-col gap-4 pt-2 border-t border-theme-border/40">
          {/* Cor do Glow (não necessária em RGB Chroma, pois cicla todas as cores) */}
          {currentEffect !== "rgb-chroma" && (
            <div className="flex flex-col gap-2">
              <ColorPicker
                label="Cor do Brilho / Aura"
                color={glowColor}
                onChange={(c) => onChange({ glowColor: c })}
              />

              {/* Cores rápidas de Glow */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {QUICK_GLOW_COLORS.map((qc) => (
                  <button
                    key={qc.color}
                    type="button"
                    onClick={() => onChange({ glowColor: qc.color })}
                    className={`w-6 h-6 rounded-full border border-white/60 shadow-sm transition-transform ${
                      glowColor.toLowerCase() === qc.color.toLowerCase()
                        ? "scale-125 ring-2 ring-theme-primary"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: qc.color }}
                    title={qc.label}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Intensidade / Raio do Brilho */}
          <Slider
            label="Intensidade do Brilho (Raio)"
            value={glowRadius}
            min={2}
            max={30}
            step={1}
            unit="px"
            onChange={(val) => onChange({ glowRadius: val })}
          />

          {/* Velocidade da Animação (para efeitos animados) */}
          {currentEffect !== "neon" && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-theme-text">Velocidade da Animação</span>
                <span className="text-[11px] font-mono font-bold text-theme-primary">
                  {animationSpeed}s
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ animationSpeed: 3.5 })}
                  className={`py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    animationSpeed >= 3
                      ? "bg-theme-primary text-white border-theme-primary shadow-soft"
                      : "bg-theme-surface border-theme-border/60 text-theme-text-muted hover:text-theme-text"
                  }`}
                >
                  🐢 Suave (3.5s)
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ animationSpeed: 1.8 })}
                  className={`py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    animationSpeed >= 1.5 && animationSpeed < 3
                      ? "bg-theme-primary text-white border-theme-primary shadow-soft"
                      : "bg-theme-surface border-theme-border/60 text-theme-text-muted hover:text-theme-text"
                  }`}
                >
                  🌸 Normal (1.8s)
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ animationSpeed: 0.8 })}
                  className={`py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    animationSpeed < 1.5
                      ? "bg-theme-primary text-white border-theme-primary shadow-soft"
                      : "bg-theme-surface border-theme-border/60 text-theme-text-muted hover:text-theme-text"
                  }`}
                >
                  🐇 Rápida (0.8s)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
