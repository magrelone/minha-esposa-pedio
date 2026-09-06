import React, { useState } from "react";
import { useCrosshairStore } from "../store/crosshairStore";
import { EmojiLayer, GlowEffectType } from "../types";
import { EmojiProvider, EmojiStyle } from "@/core/providers/emojiProvider";
import { Sparkles, Palette, Zap } from "lucide-react";
import { useToast } from "@/core/components/Toast";


interface EmojiCategory {
  name: string;
  emoji: string;
  items: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: "Corações & Amor",
    emoji: "❤️",
    items: ["❤️", "💖", "💕", "💗", "💓", "💞", "💘", "💌", "💟", "❣️", "💔", "💝", "🤍", "💜", "💙", "💚", "💛", "🧡"],
  },
  {
    name: "Rostos & Fofura",
    emoji: "🥰",
    items: ["🥰", "😍", "😘", "🥺", "😊", "🥹", "😻", "😽", "😸", "😇", "🥳", "😜", "😎", "🤩", "😋", "🤗", "🤭", "🫠"],
  },
  {
    name: "Gatinhos & Pets",
    emoji: "🐱",
    items: ["🐱", "🐈", "🐾", "🐶", "🐕", "🐰", "🐇", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🦄"],
  },
  {
    name: "Natureza & Flores",
    emoji: "🌸",
    items: ["🌸", "🌺", "🌹", "🌷", "🌻", "🌼", "🌿", "🍀", "🍃", "🍁", "🍄", "🍓", "🍒", "🍑", "🍎", "🧁", "🍭", "🍩"],
  },
  {
    name: "Efeitos Especiais",
    emoji: "✨",
    items: ["✨", "💫", "🌟", "🎇", "🎆", "💥", "⚡", "🔥", "🫧", "💠", "💮", "🌀", "❄️", "🪄", "🪩", "🔮", "💎"],
  },
];

export const EmojiPicker: React.FC = () => {
  const { addLayer } = useCrosshairStore();
  const { addToast } = useToast();
  const [activeCategory, setActiveCategory] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<EmojiStyle>("twemoji");
  const [selectedEffect, setSelectedEffect] = useState<GlowEffectType>("rgb-chroma");

  const handleSelectEmoji = (emoji: string) => {
    const layer: EmojiLayer = {
      id: `emoji-${Date.now()}`,
      name: `Emoji ${emoji} (${selectedStyle})`,
      type: "emoji",
      emoji,
      fontSize: 22,
      visible: true,
      locked: false,
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      color: "#ec4899",
      glow: selectedEffect !== "none",
      glowEffect: selectedEffect,
      glowColor: "#ff0055",
      glowRadius: 12,
      animationSpeed: 2.2,
      shadow: true,
    };
    addLayer(layer);
    addToast(
      selectedEffect === "rgb-chroma"
        ? `Emoji ${emoji} adicionado com borda Arco-Íris RGB! 🌈`
        : `Emoji ${emoji} adicionado com brilho! ✨`,
      "love"
    );
  };

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Seletor de Efeito / Borda RGB do Emoji */}
      <div className="flex flex-col gap-2 bg-theme-surface-card p-3 rounded-cute border border-theme-border/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-theme-text flex items-center gap-1.5">
            <Zap size={14} className="text-pink-500 fill-pink-400" />
            Borda / Efeito Inicial do Emoji:
          </span>
          <span className="text-[10px] uppercase font-black text-theme-primary px-2 py-0.5 rounded-md bg-theme-surface border border-theme-border/60">
            {selectedEffect === "rgb-chroma"
              ? "🌈 Arco-Íris RGB"
              : selectedEffect === "neon"
              ? "💡 Neon Fixo"
              : selectedEffect === "pulse-glow"
              ? "💓 Pulsante"
              : selectedEffect === "heartbeat"
              ? "💖 Batimento"
              : "🌸 Normal"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
          {[
            { id: "rgb-chroma", label: "🌈 RGB Chroma" },
            { id: "neon", label: "💡 Neon Fixo" },
            { id: "pulse-glow", label: "💓 Pulsante" },
            { id: "heartbeat", label: "💖 Batimento" },
            { id: "none", label: "🌸 Sem Efeito" },
          ].map((eff) => (
            <button
              key={eff.id}
              type="button"
              onClick={() => setSelectedEffect(eff.id as GlowEffectType)}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                selectedEffect === eff.id
                  ? "bg-theme-primary text-white border-theme-primary shadow-soft"
                  : "bg-theme-surface border-theme-border/60 text-theme-text-muted hover:text-theme-text"
              }`}
            >
              {eff.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seletor de Estilo de Emojis */}
      <div className="flex flex-col gap-2 bg-theme-surface-card p-3 rounded-cute border border-theme-border/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-theme-text flex items-center gap-1.5">
            <Palette size={14} className="text-theme-primary" />
            Fonte / Estilo de Renderização:
          </span>
          <span className="text-[11px] text-theme-text-muted font-medium">
            {EmojiProvider.STYLES.find((s) => s.id === selectedStyle)?.description}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {EmojiProvider.STYLES.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStyle(st.id)}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-semibold transition-all ${
                selectedStyle === st.id
                  ? "border-theme-primary bg-theme-primary text-white shadow-soft font-bold"
                  : "border-theme-border/60 bg-theme-surface text-theme-text-muted hover:text-theme-text"
              }`}
            >
              <span>{st.emoji}</span>
              <span>{st.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Categoria Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {EMOJI_CATEGORIES.map((cat, idx) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(idx)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all font-medium ${
              activeCategory === idx
                ? "bg-theme-primary text-white font-bold shadow-soft"
                : "bg-theme-surface-card text-theme-text-muted hover:text-theme-text border border-theme-border/40"
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Grid de Emojis com renderização no estilo selecionado */}
      <div className="bg-theme-surface-card p-4 rounded-cute border border-theme-border/60">
        <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
          {EMOJI_CATEGORIES[activeCategory].items.map((emoji, idx) => {
            const svgUrl = EmojiProvider.getSvgUrl(emoji, selectedStyle);

            return (
              <button
                key={`${emoji}-${idx}`}
                onClick={() => handleSelectEmoji(emoji)}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-theme-surface hover:bg-theme-primary-light border border-theme-border/40 hover:border-theme-primary shadow-xs hover:scale-120 active:scale-95 transition-all duration-150 group"
                title={`Adicionar ${emoji} (Estilo ${selectedStyle})`}
              >
                {svgUrl ? (
                  <img
                    src={svgUrl}
                    alt={emoji}
                    className="w-7 h-7 object-contain pointer-events-none drop-shadow-xs"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-2xl">{emoji}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-theme-text-muted text-center flex items-center justify-center gap-1.5">
        <Sparkles size={13} className="text-amber-500" />
        <span>O mesmo emoji pode ter estilos visuais diferentes no jogo. Escolha o seu favorito!</span>
      </div>
    </div>
  );
};
