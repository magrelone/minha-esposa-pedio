import React, { useState } from "react";
import {
  CrosshairLayer,
  GeometryLayer,
  GeometryShape,
} from "../types";
import { useCrosshairStore } from "../store/crosshairStore";
import { Slider } from "@/core/components/Slider";
import { ColorPicker } from "@/core/components/ColorPicker";
import { Toggle } from "@/core/components/Toggle";
import { Button } from "@/core/components/Button";
import {
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Layers,
  Shapes,
  RotateCcw,
} from "lucide-react";
import { GlowAndAnimationControls } from "./GlowAndAnimationControls";



const GEOMETRY_SHAPES: { id: GeometryShape; label: string }[] = [
  { id: "heart", label: "Coração 💕" },
  { id: "dot", label: "Ponto Central" },
  { id: "circle", label: "Círculo Preenchido" },
  { id: "hollow-circle", label: "Círculo Vazado" },
  { id: "cross", label: "Cruz Tradicional" },
  { id: "x", label: "X Diagonal" },
  { id: "star", label: "Estrela ✨" },
  { id: "diamond", label: "Losango 💎" },
  { id: "square", label: "Quadrado" },
  { id: "hollow-square", label: "Quadrado Vazado" },
  { id: "triangle", label: "Triângulo" },
  { id: "corner-brackets", label: "Cantoneiras Táticas" },
  { id: "hexagon", label: "Hexágono" },
];

export const LayeredEditor: React.FC = () => {
  const {
    activeCrosshair,
    addLayer,
    updateLayer,
    removeLayer,
    reorderLayers,
  } = useCrosshairStore();

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(
    activeCrosshair.layers[0]?.id || null
  );

  const selectedLayer = activeCrosshair.layers.find((l) => l.id === selectedLayerId);

  const handleAddGeometryLayer = (shape: GeometryShape) => {
    const newLayer: GeometryLayer = {
      id: `geom-${Date.now()}`,
      name: `${GEOMETRY_SHAPES.find((s) => s.id === shape)?.label || "Camada"}`,
      type: "geometry",
      shape,
      visible: true,
      locked: false,
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      color: shape === "heart" ? "#ec4899" : "#00ff66",
      size: shape === "dot" ? 3 : 12,
      thickness: 2,
      hollow: shape.includes("hollow") || shape === "corner-brackets",
      outline: true,
      outlineThickness: 1,
      outlineColor: "#000000",
    };
    addLayer(newLayer);
    setSelectedLayerId(newLayer.id);
  };

  const handleDuplicateLayer = (layer: CrosshairLayer) => {
    const duplicate: CrosshairLayer = {
      ...JSON.parse(JSON.stringify(layer)),
      id: `layer-${Date.now()}`,
      name: `${layer.name} (Cópia)`,
      x: layer.x + 2,
      y: layer.y + 2,
    };
    addLayer(duplicate);
    setSelectedLayerId(duplicate.id);
  };

  return (
    <div className="flex flex-col gap-6 p-1">
      {/* Barra de Ações: Adicionar Camada */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-text-muted flex items-center gap-1.5">
            <Layers size={14} />
            Camadas ({activeCrosshair.layers.length})
          </h4>
        </div>

        {/* Dropdown / Botões de Formas Rápidas */}
        <div className="bg-theme-surface-card p-3 rounded-cute border border-theme-border/60 flex flex-col gap-2">
          <span className="text-xs font-medium text-theme-text flex items-center gap-1">
            <Shapes size={13} className="text-theme-primary" />
            Adicionar elemento geométrico:
          </span>
          <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {GEOMETRY_SHAPES.map((shape) => (
              <button
                key={shape.id}
                type="button"
                onClick={() => handleAddGeometryLayer(shape.id)}
                className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-theme-surface hover:bg-theme-primary-light border border-theme-border/40 text-theme-text hover:text-theme-primary transition-all flex items-center justify-between group"
              >
                <span>{shape.label}</span>
                <Plus size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lista de Camadas Ordenáveis */}
      <section className="flex flex-col gap-2">
        {activeCrosshair.layers.length === 0 ? (
          <div className="text-center py-6 px-4 border-2 border-dashed border-theme-border/60 rounded-cute">
            <p className="text-xs text-theme-text-muted">
              Nenhuma camada ainda. Adicione uma forma geométrica, emoji ou ícone acima 💕
            </p>
          </div>
        ) : (
          activeCrosshair.layers.map((layer, index) => {
            const isSelected = layer.id === selectedLayerId;
            return (
              <div
                key={layer.id}
                onClick={() => setSelectedLayerId(layer.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-theme-primary/10 border-theme-primary shadow-xs"
                    : "bg-theme-surface-card border-theme-border hover:border-theme-primary/40"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 flex-shrink-0"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="text-xs font-medium text-theme-text truncate">
                    {layer.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Reordenar */}
                  <button
                    disabled={index === 0}
                    onClick={() => reorderLayers(index, index - 1)}
                    className="p-1 rounded hover:bg-theme-surface text-theme-text-muted disabled:opacity-20"
                    title="Mover para cima"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    disabled={index === activeCrosshair.layers.length - 1}
                    onClick={() => reorderLayers(index, index + 1)}
                    className="p-1 rounded hover:bg-theme-surface text-theme-text-muted disabled:opacity-20"
                    title="Mover para baixo"
                  >
                    <ChevronDown size={13} />
                  </button>
                  {/* Visibilidade */}
                  <button
                    onClick={() => updateLayer(layer.id, { visible: !layer.visible })}
                    className="p-1 rounded hover:bg-theme-surface text-theme-text-muted hover:text-theme-primary"
                  >
                    {layer.visible ? <Eye size={13} /> : <EyeOff size={13} className="text-red-400" />}
                  </button>
                  {/* Duplicar */}
                  <button
                    onClick={() => handleDuplicateLayer(layer)}
                    className="p-1 rounded hover:bg-theme-surface text-theme-text-muted hover:text-theme-primary"
                    title="Duplicar"
                  >
                    <Copy size={13} />
                  </button>
                  {/* Excluir */}
                  <button
                    onClick={() => removeLayer(layer.id)}
                    className="p-1 rounded hover:bg-theme-surface text-theme-text-muted hover:text-red-500"
                    title="Excluir"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Propriedades da Camada Selecionada */}
      {selectedLayer && (
        <section className="flex flex-col gap-4 pt-2 border-t border-theme-border/60">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-text-muted">
            Editar: {selectedLayer.name}
          </h4>

          <ColorPicker
            label="Cor do Elemento"
            color={selectedLayer.color}
            onChange={(color) => updateLayer(selectedLayer.id, { color })}
          />

          <Slider
            label="Tamanho Geral"
            value={
              selectedLayer.type === "geometry"
                ? (selectedLayer as GeometryLayer).size
                : 12
            }
            min={1}
            max={50}
            step={1}
            unit="px"
            onChange={(size) => updateLayer(selectedLayer.id, { size } as any)}
          />

          {selectedLayer.type === "geometry" && (
            <>
              <Slider
                label="Espessura da Linha"
                value={(selectedLayer as GeometryLayer).thickness}
                min={1}
                max={10}
                step={1}
                unit="px"
                onChange={(thickness) => updateLayer(selectedLayer.id, { thickness } as any)}
              />
              <Toggle
                label="Preenchimento Vazado (Hollow)"
                checked={(selectedLayer as GeometryLayer).hollow}
                onChange={(hollow) => updateLayer(selectedLayer.id, { hollow } as any)}
              />
              <Toggle
                label="Contorno Externo"
                checked={(selectedLayer as GeometryLayer).outline}
                onChange={(outline) => updateLayer(selectedLayer.id, { outline } as any)}
              />
              {(selectedLayer as GeometryLayer).outline && (
                <Slider
                  label="Espessura do Contorno"
                  value={(selectedLayer as GeometryLayer).outlineThickness}
                  min={0.5}
                  max={4}
                  step={0.5}
                  unit="px"
                  onChange={(outlineThickness) => updateLayer(selectedLayer.id, { outlineThickness } as any)}
                />
              )}
            </>
          )}

          {/* Transformações */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-theme-text-muted">
              Posição & Offset da Camada
            </span>
            {(selectedLayer.x !== 0 || selectedLayer.y !== 0) && (
              <button
                type="button"
                onClick={() => updateLayer(selectedLayer.id, { x: 0, y: 0 })}
                className="text-[11px] text-theme-primary font-bold hover:underline flex items-center gap-1"
                title="Voltar esta forma/camada para o centro exato (0, 0)"
              >
                <RotateCcw size={12} />
                <span>Centralizar Camada (0, 0)</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">

            <Slider
              label="Offset X (Horizontal)"
              value={selectedLayer.x}
              min={-500}
              max={500}
              step={1}
              unit="px"
              onChange={(x) => updateLayer(selectedLayer.id, { x })}
            />
            <Slider
              label="Offset Y (Vertical)"
              value={selectedLayer.y}
              min={-500}
              max={500}
              step={1}
              unit="px"
              onChange={(y) => updateLayer(selectedLayer.id, { y })}
            />
          </div>


          <Slider
            label="Rotação"
            value={selectedLayer.rotation}
            min={0}
            max={360}
            step={5}
            unit="°"
            onChange={(rotation) => updateLayer(selectedLayer.id, { rotation })}
          />

          <Slider
            label="Opacidade"
            value={Math.round(selectedLayer.opacity * 100)}
            min={10}
            max={100}
            step={1}
            unit="%"
            onChange={(op) => updateLayer(selectedLayer.id, { opacity: op / 100 })}
          />

          {/* Glow, Bordas RGB e Animações */}
          <GlowAndAnimationControls
            glow={selectedLayer.glow}
            glowEffect={selectedLayer.glowEffect}
            glowColor={selectedLayer.glowColor || selectedLayer.color}
            glowRadius={selectedLayer.glowRadius}
            animationSpeed={selectedLayer.animationSpeed}
            onChange={(patch) => updateLayer(selectedLayer.id, patch)}
          />
        </section>

      )}
    </div>
  );
};
