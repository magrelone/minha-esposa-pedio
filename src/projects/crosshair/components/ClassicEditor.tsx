import React from "react";
import { Slider } from "@/core/components/Slider";
import { Toggle } from "@/core/components/Toggle";
import { ColorPicker } from "@/core/components/ColorPicker";
import { useCrosshairStore } from "../store/crosshairStore";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CircleDot, Heart, Layers } from "lucide-react";
import { GlowAndAnimationControls } from "./GlowAndAnimationControls";


interface ClassicEditorProps {
  onSwitchTab?: (tab: "layers" | "emojis" | "icons") => void;
}

export const ClassicEditor: React.FC<ClassicEditorProps> = () => {
  const { activeCrosshair, updateClassicConfig } = useCrosshairStore();

  const fallbackColor = activeCrosshair.layers[0]?.color || "#ff69b4";
  const cfg = activeCrosshair.classicConfig || {
    id: "classic-default",
    name: "Linhas Clássicas",
    type: "classic" as const,
    visible: true,
    locked: false,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    color: fallbackColor,
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

  return (
    <div className="flex flex-col gap-6 p-1">
      {!activeCrosshair.classicConfig && (
        <div className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-xl text-xs text-theme-primary flex items-center gap-2">
          <Heart size={15} className="fill-pink-500 flex-shrink-0" />
          <span>
            Esta mira possui formas/corações. Qualquer ajuste abaixo ativará e personalizará linhas táticas sobre ela!
          </span>
        </div>
      )}

      {/* 1. Cores e Transparência */}
      <section className="flex flex-col gap-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-text-muted">
          Cor & Transparência
        </h4>
        <ColorPicker
          label="Cor da Mira"
          color={cfg.color}
          onChange={(color) => updateClassicConfig({ color })}
        />
        <Slider
          label="Opacidade (Alpha)"
          value={Math.round(cfg.opacity * 100)}
          min={10}
          max={100}
          step={1}
          unit="%"
          onChange={(v) => updateClassicConfig({ opacity: v / 100 })}
        />
      </section>

      <hr className="border-theme-border/40" />

      {/* 2. Dimensões Principais */}
      <section className="flex flex-col gap-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-text-muted">
          Dimensões Principais
        </h4>
        <Slider
          label="Comprimento (Size)"
          value={cfg.size}
          min={0}
          max={40}
          step={1}
          unit="px"
          onChange={(size) => updateClassicConfig({ size })}
        />
        <Slider
          label="Espessura (Thickness)"
          value={cfg.thickness}
          min={1}
          max={16}
          step={1}
          unit="px"
          onChange={(thickness) => updateClassicConfig({ thickness })}
        />
        <Slider
          label="Espaço Central (Gap)"
          value={cfg.gap}
          min={-30}
          max={100}
          step={1}
          unit="px"
          onChange={(gap) => updateClassicConfig({ gap })}
        />

      </section>

      <hr className="border-theme-border/40" />

      {/* 3. Ponto Central (Dot) */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CircleDot size={16} className="text-theme-primary" />
            <span className="text-xs font-semibold text-theme-text">Ponto Central</span>
          </div>
          <Toggle
            label="Ponto Central"
            checked={cfg.dot}
            onChange={(dot) => updateClassicConfig({ dot })}
          />
        </div>

        {cfg.dot && (
          <Slider
            label="Tamanho do Ponto"
            value={cfg.dotSize || cfg.thickness}
            min={1}
            max={16}
            step={1}
            unit="px"
            onChange={(dotSize) => updateClassicConfig({ dotSize })}
          />
        )}
      </section>

      <hr className="border-theme-border/40" />

      {/* 4. Contorno (Outline) */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-theme-text">Contorno de Borda</span>
          <Toggle
            label="Contorno de Borda"
            checked={cfg.outline}
            onChange={(outline) => updateClassicConfig({ outline })}
          />

        </div>

        {cfg.outline && (
          <>
            <Slider
              label="Espessura da Borda"
              value={cfg.outlineThickness}
              min={1}
              max={6}
              step={0.5}
              unit="px"
              onChange={(outlineThickness) => updateClassicConfig({ outlineThickness })}
            />
            <ColorPicker
              label="Cor da Borda"
              color={cfg.outlineColor || "#000000"}
              onChange={(outlineColor) => updateClassicConfig({ outlineColor })}
            />
          </>
        )}
      </section>

      <hr className="border-theme-border/40" />

      {/* 5. Linhas Individuais (Estilo T & Cantos) */}
      <section className="flex flex-col gap-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-text-muted">
          Linhas Ativas
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <Toggle
            label="Linha Superior"
            checked={cfg.showTop}
            disabled={cfg.tStyle}
            onChange={(showTop) => updateClassicConfig({ showTop })}
          />
          <Toggle
            label="Linha Inferior"
            checked={cfg.showBottom}
            onChange={(showBottom) => updateClassicConfig({ showBottom })}
          />
          <Toggle
            label="Linha Esquerda"
            checked={cfg.showLeft}
            onChange={(showLeft) => updateClassicConfig({ showLeft })}
          />
          <Toggle
            label="Linha Direita"
            checked={cfg.showRight}
            onChange={(showRight) => updateClassicConfig({ showRight })}
          />
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Toggle
            label="Estilo T (Sem linha no topo)"
            checked={cfg.tStyle}
            onChange={(tStyle) => updateClassicConfig({ tStyle })}
          />
          <Toggle
            label="Pontas Arredondadas (Delicado)"
            checked={cfg.rounded}
            onChange={(rounded) => updateClassicConfig({ rounded })}
          />
        </div>
      </section>

      <hr className="border-theme-border/40" />

      {/* 5. Glow, Bordas RGB e Animações */}
      <GlowAndAnimationControls
        glow={cfg.glow}
        glowEffect={cfg.glowEffect}
        glowColor={cfg.glowColor || cfg.color}
        glowRadius={cfg.glowRadius}
        animationSpeed={cfg.animationSpeed}
        onChange={(patch) => updateClassicConfig(patch)}
      />
    </div>
  );
};

