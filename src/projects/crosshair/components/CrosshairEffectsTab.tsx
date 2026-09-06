import React from "react";
import { useCrosshairStore } from "../store/crosshairStore";
import { GlowEffectType } from "../types";
import {
  Sparkles,
  Zap,
  Flame,
  Heart,
  RotateCw,
  Activity,
  Layers,
  Palette,
  Sliders,
  Waves,
  Ghost,
  Repeat,
} from "lucide-react";
import { Slider } from "@/core/components/Slider";
import { useToast } from "@/core/components/Toast";

interface EffectOption {
  id: GlowEffectType;
  label: string;
  desc: string;
  icon: React.ReactNode;
  badge?: string;
  colorClass: string;
}

const EFFECTS_LIST: EffectOption[] = [
  {
    id: "rgb-chroma",
    label: "Arco-Íris RGB Chroma",
    desc: "Borda luminosa que cicla suavemente todas as cores do espectro",
    icon: <Sparkles size={18} className="text-pink-400" />,
    badge: "Popular 🌈",
    colorClass: "from-rose-500 via-amber-400 to-cyan-400",
  },
  {
    id: "flame",
    label: "Fogo & Chamas Vivas",
    desc: "Aura ardente com oscilação de calor vermelho, laranja e dourado",
    icon: <Flame size={18} className="text-amber-500" />,
    badge: "Quente 🔥",
    colorClass: "from-amber-500 to-rose-600",
  },
  {
    id: "electric",
    label: "Choque Elétrico Glitch",
    desc: "Micro-vibração eletrizante de alta voltagem estilo Cyberpunk",
    icon: <Zap size={18} className="text-cyan-400" />,
    badge: "Cyber ⚡",
    colorClass: "from-cyan-400 to-blue-600",
  },
  {
    id: "pulse-glow",
    label: "Respiração Pulsante",
    desc: "Expansão e contração relaxante em ritmo suave de respiração",
    icon: <Activity size={18} className="text-emerald-400" />,
    badge: "Zen 🍃",
    colorClass: "from-emerald-400 to-teal-500",
  },
  {
    id: "heartbeat",
    label: "Batimento Cardíaco",
    desc: "Pulsação dupla rítmica e apaixonada (tum-tum... tum-tum)",
    icon: <Heart size={18} className="text-rose-500" />,
    badge: "Love 💖",
    colorClass: "from-rose-400 to-pink-600",
  },
  {
    id: "vaporwave",
    label: "Aura Vaporwave Neon",
    desc: "Gradiente retrô dos anos 80 transitando entre magenta, roxo e turquesa",
    icon: <Palette size={18} className="text-purple-400" />,
    badge: "Retrô 🌌",
    colorClass: "from-purple-500 via-pink-500 to-cyan-400",
  },
  {
    id: "wave",
    label: "Onda / Levitação Cósmica",
    desc: "Flutuação suave para cima e para baixo como gravidade zero",
    icon: <Waves size={18} className="text-sky-400" />,
    badge: "Suave 🌊",
    colorClass: "from-sky-400 to-indigo-500",
  },
  {
    id: "swing",
    label: "Balanço Pêndulo",
    desc: "Movimento pendular carinhoso de um lado para o outro",
    icon: <Repeat size={18} className="text-amber-400" />,
    badge: "Cute 🧸",
    colorClass: "from-amber-400 to-rose-400",
  },
  {
    id: "spin",
    label: "Rotação Contínua 360°",
    desc: "Giro orbital suave e contínuo no próprio eixo",
    icon: <RotateCw size={18} className="text-indigo-400" />,
    badge: "Giro 💫",
    colorClass: "from-indigo-400 to-purple-500",
  },
  {
    id: "sparkle",
    label: "Estrela Cintilante",
    desc: "Brilho de fadas que reluz e cintila delicadamente",
    icon: <Sparkles size={18} className="text-yellow-400" />,
    badge: "Mágico ✨",
    colorClass: "from-yellow-400 to-amber-500",
  },
  {
    id: "ghost",
    label: "Holograma Fantasma",
    desc: "Transparência mística flutuante com brilho etéreo",
    icon: <Ghost size={18} className="text-violet-400" />,
    badge: "Místico 👻",
    colorClass: "from-violet-400 to-purple-600",
  },
  {
    id: "neon",
    label: "Brilho Neon Fixo",
    desc: "Aura luminosa constante e ultra-nítida na cor que você escolher",
    icon: <Zap size={18} className="text-lime-400" />,
    colorClass: "from-lime-400 to-emerald-500",
  },
  {
    id: "none",
    label: "Sem Efeito / Normal",
    desc: "Desativa animações e brilhos, mantendo a mira limpa",
    icon: <Sliders size={18} className="text-gray-400" />,
    colorClass: "from-gray-400 to-gray-600",
  },
];

const PRESET_AURA_COLORS = [
  { label: "Pink Fofo", color: "#ff69b4" },
  { label: "Neon Rose", color: "#ff007f" },
  { label: "Cyber Ciano", color: "#00f0ff" },
  { label: "Ouro Radiante", color: "#ffbb00" },
  { label: "Verde Elétrico", color: "#00ff66" },
  { label: "Roxo Místico", color: "#aa00ff" },
  { label: "Fogo Escarlate", color: "#ff3300" },
  { label: "Branco Puro", color: "#ffffff" },
];

const SPEED_PRESETS = [
  { label: "⚡ Super Rápida", value: 0.6 },
  { label: "🏃 Rápida", value: 1.0 },
  { label: "✨ Normal", value: 1.8 },
  { label: "🍃 Suave", value: 2.8 },
  { label: "🧘 Relaxante", value: 4.2 },
];

export const CrosshairEffectsTab: React.FC = () => {
  const {
    activeCrosshair,
    updateActiveCrosshair,
    addLayer,
  } = useCrosshairStore();
  const { addToast } = useToast();

  const [selectedLayerId, setSelectedLayerId] = React.useState<string | null>(
    activeCrosshair.layers[0]?.id || null
  );

  const isLayered = activeCrosshair.type === "layered";


  // Determine current active effect and settings
  const targetLayer = isLayered
    ? activeCrosshair.layers.find((l) => l.id === selectedLayerId) || activeCrosshair.layers[0]
    : undefined;

  const currentEffect: GlowEffectType = isLayered
    ? targetLayer?.glowEffect || (targetLayer?.glow ? "neon" : "none")
    : activeCrosshair.classicConfig?.glowEffect || (activeCrosshair.classicConfig?.glow ? "neon" : "none");

  const currentGlowColor = isLayered
    ? targetLayer?.glowColor || targetLayer?.color || "#ff69b4"
    : activeCrosshair.classicConfig?.glowColor || activeCrosshair.classicConfig?.color || "#00f0ff";

  const currentRadius = isLayered
    ? targetLayer?.glowRadius ?? 10
    : activeCrosshair.classicConfig?.glowRadius ?? 10;

  const currentSpeed = isLayered
    ? targetLayer?.animationSpeed ?? 1.8
    : activeCrosshair.classicConfig?.animationSpeed ?? 1.8;

  // Apply effect to target layer or all layers
  const handleSelectEffect = (effect: GlowEffectType, applyToAll = false) => {
    updateActiveCrosshair((prev) => {
      const isEnabled = effect !== "none";

      if (prev.type === "classic" && prev.classicConfig) {
        return {
          ...prev,
          classicConfig: {
            ...prev.classicConfig,
            glow: isEnabled,
            glowEffect: effect,
          },
        };
      }

      const updatedLayers = prev.layers.map((l) => {
        if (applyToAll || l.id === targetLayer?.id) {
          return {
            ...l,
            glow: isEnabled,
            glowEffect: effect,
          };
        }
        return l;
      });

      return {
        ...prev,
        layers: updatedLayers,
      };
    });

    const effectItem = EFFECTS_LIST.find((e) => e.id === effect);
    addToast(`Efeito "${effectItem?.label || effect}" ativado! ✨`, "sparkle");
  };

  const handleUpdateColor = (color: string) => {
    updateActiveCrosshair((prev) => {
      if (prev.type === "classic" && prev.classicConfig) {
        return {
          ...prev,
          classicConfig: { ...prev.classicConfig, glowColor: color },
        };
      }
      return {
        ...prev,
        layers: prev.layers.map((l) =>
          l.id === targetLayer?.id ? { ...l, glowColor: color } : l
        ),
      };
    });
  };

  const handleUpdateRadius = (radius: number) => {
    updateActiveCrosshair((prev) => {
      if (prev.type === "classic" && prev.classicConfig) {
        return {
          ...prev,
          classicConfig: { ...prev.classicConfig, glowRadius: radius },
        };
      }
      return {
        ...prev,
        layers: prev.layers.map((l) =>
          l.id === targetLayer?.id ? { ...l, glowRadius: radius } : l
        ),
      };
    });
  };

  const handleUpdateSpeed = (speed: number) => {
    updateActiveCrosshair((prev) => {
      if (prev.type === "classic" && prev.classicConfig) {
        return {
          ...prev,
          classicConfig: { ...prev.classicConfig, animationSpeed: speed },
        };
      }
      return {
        ...prev,
        layers: prev.layers.map((l) =>
          l.id === targetLayer?.id ? { ...l, animationSpeed: speed } : l
        ),
      };
    });
  };

  // Quick test demo with cute emojis
  const handleTestEmoji = (emoji: string, defaultEffect: GlowEffectType = "rgb-chroma") => {
    addLayer({
      id: `emoji-demo-${Date.now()}`,
      name: `Emoji ${emoji}`,
      type: "emoji",
      emoji,
      fontSize: 26,
      visible: true,
      locked: false,
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      color: "#ff69b4",
      glow: true,
      glowEffect: defaultEffect,
      glowColor: "#ff007f",
      glowRadius: 14,
      animationSpeed: 2.0,
      shadow: true,
    } as any);

    addToast(`Adicionado ${emoji} com ${defaultEffect} animado! 🐱💕`, "love");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-theme-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 text-white shadow-soft">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-theme-text">
              Estúdio de Efeitos, Glow & Animações 🌈
            </h3>
            <p className="text-xs text-theme-text-muted">
              Personalize auras luminosas, bordas arco-íris, chamas e movimentos em tempo real
            </p>
          </div>
        </div>

        {/* Botão Aplicar em Tudo */}
        {isLayered && activeCrosshair.layers.length > 1 && (
          <button
            type="button"
            onClick={() => handleSelectEffect(currentEffect, true)}
            className="text-xs px-3 py-1.5 rounded-xl bg-theme-surface-card border border-theme-border/60 hover:border-theme-primary text-theme-primary font-bold transition-all shadow-sm flex items-center gap-1.5"
            title="Aplica o efeito atual em todas as camadas da mira"
          >
            <Layers size={13} />
            <span>Aplicar em Todas Camadas</span>
          </button>
        )}
      </div>

      {/* Teste Rápido com Emojis */}
      <div className="p-3.5 bg-theme-surface-card rounded-2xl border border-theme-border/60 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-theme-text">
            Testar Instantaneamente com Personagens Fofos:
          </span>
          <span className="text-[10px] text-theme-text-muted">
            Clique para adicionar com efeito
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { emoji: "🐱", label: "Gatinho RGB", effect: "rgb-chroma" as GlowEffectType },
            { emoji: "💖", label: "Coração Tum-Tum", effect: "heartbeat" as GlowEffectType },
            { emoji: "🔥", label: "Foguinho Ardente", effect: "flame" as GlowEffectType },
            { emoji: "⚡", label: "Raio Elétrico", effect: "electric" as GlowEffectType },
            { emoji: "🌸", label: "Sakura Flutuante", effect: "wave" as GlowEffectType },
            { emoji: "✨", label: "Estrela Cintilante", effect: "sparkle" as GlowEffectType },
            { emoji: "🧸", label: "Ursinho Pêndulo", effect: "swing" as GlowEffectType },
            { emoji: "👾", label: "Cyber Alien", effect: "vaporwave" as GlowEffectType },
          ].map((t) => (
            <button
              key={t.emoji}
              type="button"
              onClick={() => handleTestEmoji(t.emoji, t.effect)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-surface border border-theme-border/80 hover:border-theme-primary hover:scale-105 transition-all text-xs font-semibold shadow-sm"
            >
              <span className="text-base leading-none">{t.emoji}</span>
              <span className="text-theme-text">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Galeria de Efeitos Disponíveis */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-bold text-theme-text">
          Escolha o Efeito de Borda e Animação:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {EFFECTS_LIST.map((effect) => {
            const isSelected = currentEffect === effect.id;
            return (
              <button
                key={effect.id}
                type="button"
                onClick={() => handleSelectEffect(effect.id)}
                className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-theme-surface border-theme-primary ring-2 ring-theme-primary/20 shadow-soft"
                    : "bg-theme-surface-card border-theme-border/60 hover:border-theme-primary/40 hover:bg-theme-surface"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${effect.colorClass} text-white shadow-sm`}
                >
                  {effect.icon}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-theme-text truncate">
                      {effect.label}
                    </span>
                    {effect.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-theme-primary/10 text-theme-primary whitespace-nowrap">
                        {effect.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-theme-text-muted line-clamp-2 leading-tight mt-0.5">
                    {effect.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Seção de Ajustes Avançados (Cores, Raio e Velocidade) */}
      {currentEffect !== "none" && (
        <div className="flex flex-col gap-5 p-4 rounded-2xl bg-theme-surface-card border border-theme-border/60">
          {/* Cor da Aura */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-theme-text">
              Cor da Luz Neon / Aura (Para efeitos que usam cor base):
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_AURA_COLORS.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => handleUpdateColor(c.color)}
                  className={`w-7 h-7 rounded-xl border-2 transition-all flex items-center justify-center ${
                    currentGlowColor.toLowerCase() === c.color.toLowerCase()
                      ? "scale-110 border-white shadow-soft"
                      : "border-transparent opacity-85 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
              <div className="flex items-center gap-1.5 ml-auto">
                <input
                  type="color"
                  value={currentGlowColor}
                  onChange={(e) => handleUpdateColor(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer border border-theme-border bg-transparent p-0"
                />
                <span className="text-xs font-mono text-theme-text font-bold">
                  {currentGlowColor.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Raio do Brilho (Glow Radius) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-theme-text">
                Tamanho da Borda / Raio do Brilho:
              </span>
              <span className="text-xs font-mono font-bold text-theme-primary">
                {currentRadius}px
              </span>
            </div>
            <Slider
              label=""
              value={currentRadius}
              min={2}
              max={35}
              step={1}
              unit="px"
              onChange={handleUpdateRadius}
            />
          </div>

          {/* Velocidade da Animação */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-theme-text">
                Ritmo / Velocidade da Animação:
              </span>
              <span className="text-xs font-mono font-bold text-theme-primary">
                {currentSpeed}s
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {SPEED_PRESETS.map((sp) => (
                <button
                  key={sp.label}
                  type="button"
                  onClick={() => handleUpdateSpeed(sp.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    Math.abs(currentSpeed - sp.value) < 0.2
                      ? "bg-theme-primary text-white border-theme-primary shadow-soft"
                      : "bg-theme-surface border-theme-border/60 text-theme-text hover:border-theme-primary"
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
