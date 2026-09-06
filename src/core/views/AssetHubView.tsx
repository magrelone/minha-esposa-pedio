import React, { useState, useEffect } from "react";
import { IconifyProvider, IconifyResult, POPULAR_COLLECTIONS } from "../providers/iconifyProvider";
import { EmojiProvider, EmojiStyle } from "../providers/emojiProvider";
import { PROCEDURAL_PRESETS } from "@/projects/crosshair/engine/procedural-presets";
import { useCrosshairStore } from "@/projects/crosshair/store/crosshairStore";
import { CrosshairItem, IconLayer, EmojiLayer, GeometryLayer, GeometryShape } from "@/projects/crosshair/types";
import { Button } from "@/core/components/Button";
import { Card } from "@/core/components/Card";
import { useToast } from "@/core/components/Toast";
import {
  Search,
  Sparkles,
  Layers,
  Heart,
  Plus,
  ExternalLink,
  Info,
  Palette,
  Smile,
  Target,
  Shapes,
} from "lucide-react";

interface AssetHubViewProps {
  onNavigateToStudio: () => void;
}

const COMMON_EMOJIS = [
  { char: "❤️", name: "Coração Vermelho", tags: ["coracao", "amor", "heart"] },
  { char: "💖", name: "Coração Brilhante", tags: ["coracao", "brilho", "sparkle"] },
  { char: "💕", name: "Dois Corações", tags: ["coracao", "amor", "fofo"] },
  { char: "🌸", name: "Flor de Cerejeira", tags: ["sakura", "flor", "flower"] },
  { char: "⭐", name: "Estrela", tags: ["estrela", "star", "brilho"] },
  { char: "✨", name: "Brilhos Mágicos", tags: ["sparkle", "magica", "brilho"] },
  { char: "🐱", name: "Gatinho Fofo", tags: ["gato", "cat", "animal"] },
  { char: "🍓", name: "Morango Doce", tags: ["morango", "strawberry", "comida"] },
  { char: "🎯", name: "Alvo no Centro", tags: ["alvo", "target", "mira"] },
  { char: "🔥", name: "Fogo / Chama", tags: ["fogo", "fire", "flame"] },
  { char: "⚡", name: "Raio Elétrico", tags: ["raio", "zap", "eletrico"] },
  { char: "💎", name: "Diamante", tags: ["diamante", "diamond", "joia"] },
  { char: "🦋", name: "Borboleta", tags: ["borboleta", "butterfly", "natureza"] },
  { char: "👑", name: "Coroa Real", tags: ["coroa", "crown", "realeza"] },
  { char: "🎀", name: "Lacinho Rosa", tags: ["laco", "ribbon", "rosa"] },
  { char: "🧁", name: "Cupcake Doce", tags: ["cupcake", "doce", "fofo"] },
];

const GEOMETRIC_SHAPES: { shape: GeometryShape; name: string; tags: string[] }[] = [
  { shape: "heart", name: "Coração Geométrico 💕", tags: ["coracao", "heart", "amor"] },
  { shape: "star", name: "Estrela de 5 Pontas ✨", tags: ["estrela", "star", "brilho"] },
  { shape: "cross", name: "Cruz de Precisão", tags: ["cruz", "cross", "mira"] },
  { shape: "dot", name: "Ponto Cirúrgico", tags: ["ponto", "dot", "pixel"] },
  { shape: "corner-brackets", name: "Cantoneiras Táticas", tags: ["brackets", "alvo", "visor"] },
  { shape: "diamond", name: "Losango Vazado", tags: ["diamante", "losango", "diamond"] },
  { shape: "circle", name: "Círculo Perfeito", tags: ["circulo", "circle"] },
  { shape: "hollow-circle", name: "Círculo Vazado", tags: ["circulo", "hollow"] },
];

export const AssetHubView: React.FC<AssetHubViewProps> = ({ onNavigateToStudio }) => {
  const { setActiveCrosshair, addLayer } = useCrosshairStore();
  const { addToast } = useToast();

  const [search, setSearch] = useState("heart");
  const [activeTab, setActiveTab] = useState<"all" | "icons" | "emojis" | "shapes" | "presets">("all");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [emojiStyle, setEmojiStyle] = useState<EmojiStyle>("twemoji");

  const [iconResults, setIconResults] = useState<IconifyResult[]>([]);
  const [loadingIcons, setLoadingIcons] = useState(false);

  // Debounced search on Iconify API
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      if (!search.trim()) {
        setIconResults([]);
        return;
      }
      setLoadingIcons(true);
      const res = await IconifyProvider.search(search, selectedCollection, 36);
      if (active) {
        setIconResults(res);
        setLoadingIcons(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, selectedCollection]);

  // Filter emojis
  const matchedEmojis = COMMON_EMOJIS.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      e.char.includes(search)
  );

  // Filter shapes
  const matchedShapes = GEOMETRIC_SHAPES.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  // Filter presets
  const matchedPresets = PROCEDURAL_PRESETS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleUseIcon = (icon: IconifyResult) => {
    const layer: IconLayer = {
      id: `icon-${Date.now()}`,
      name: `${icon.name} (${icon.collectionName})`,
      type: "icon",
      iconName: icon.icon,
      size: 18,
      visible: true,
      locked: false,
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      color: "#ec4899",
      collection: icon.collectionName,
      license: "Open Source",
    };
    addLayer(layer);
    addToast(`Ícone "${icon.name}" adicionado à mira! ✨`, "sparkle");
  };

  const handleUseEmoji = (char: string, name: string) => {
    const layer: EmojiLayer = {
      id: `emoji-${Date.now()}`,
      name: `Emoji ${name}`,
      type: "emoji",
      emoji: char,
      fontSize: 20,
      visible: true,
      locked: false,
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      color: "#ec4899",
      glow: true,
      glowColor: "#ec4899",
      shadow: true,
    };
    addLayer(layer);
    addToast(`Emoji ${char} adicionado como camada! 💕`, "love");
  };

  const handleUseShape = (shape: GeometryShape, name: string) => {
    const layer: GeometryLayer = {
      id: `shape-${Date.now()}`,
      name,
      type: "geometry",
      shape,
      size: shape === "dot" ? 3 : 14,
      thickness: 2,
      hollow: shape.includes("hollow") || shape === "corner-brackets",
      visible: true,
      locked: false,
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      color: shape === "heart" ? "#ec4899" : "#00ff66",
      outline: true,
      outlineThickness: 1,
      outlineColor: "#000000",
    };
    addLayer(layer);
    addToast(`Forma "${name}" adicionada com sucesso! 🎯`, "success");
  };

  const handleUsePreset = (preset: CrosshairItem) => {
    setActiveCrosshair(preset);
    addToast(`Mira "${preset.name}" carregada no Studio! 💗`, "love");
    onNavigateToStudio();
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto py-2">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-transparent p-6 rounded-cuter border border-theme-border/60 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-theme-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-theme-primary">
              Asset Hub Unificado
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-theme-text mt-0.5">
            Pesquise tudo em um só lugar ✨
          </h2>
          <p className="text-xs text-theme-text-muted mt-1">
            Mais de 300 mil ícones (Iconify, Phosphor, Tabler, Lucide, Bootstrap), emojis multi-estilo, formas e miras.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Target size={15} />}
          onClick={onNavigateToStudio}
        >
          Ir para o Crosshair Studio 🎯
        </Button>
      </div>

      {/* Global Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por coração, estrela, gato, target, flor, espada, fogo..."
            className="w-full h-12 pl-12 pr-4 text-sm bg-theme-surface border border-theme-border rounded-cute text-theme-text focus:outline-none focus:border-theme-primary shadow-soft transition-colors"
          />
        </div>

        {/* Quick Search Tags */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none items-center text-xs">
          <span className="text-[11px] text-theme-text-muted mr-1 font-semibold">Exemplos:</span>
          {["heart", "star", "cat", "flower", "target", "sword", "crosshair"].map((tag) => (
            <button
              key={tag}
              onClick={() => setSearch(tag)}
              className="px-2.5 py-1 rounded-lg bg-theme-surface-card hover:bg-theme-primary-light border border-theme-border/40 text-theme-text-muted hover:text-theme-primary transition-all font-medium"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-theme-border/60 pb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: "all", label: "Tudo Junto ✨" },
            { id: "icons", label: `Ícones (${iconResults.length})` },
            { id: "emojis", label: `Emojis (${matchedEmojis.length})` },
            { id: "shapes", label: `Formas (${matchedShapes.length})` },
            { id: "presets", label: `Miras & Presets (${matchedPresets.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all font-medium ${
                activeTab === tab.id
                  ? "bg-theme-primary text-white shadow-soft font-bold"
                  : "bg-theme-surface-card text-theme-text-muted hover:text-theme-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Iconify Collection Filter & Emoji Style Picker */}
        <div className="flex items-center gap-2 text-xs">
          {activeTab === "icons" && (
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="bg-theme-surface-card border border-theme-border rounded-xl px-2.5 py-1 text-xs text-theme-text focus:outline-none"
            >
              {POPULAR_COLLECTIONS.map((c) => (
                <option key={c.id} value={c.prefix}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {activeTab === "emojis" && (
            <select
              value={emojiStyle}
              onChange={(e) => setEmojiStyle(e.target.value as any)}
              className="bg-theme-surface-card border border-theme-border rounded-xl px-2.5 py-1 text-xs text-theme-text focus:outline-none"
            >
              {EmojiProvider.STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} Estilo {s.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 1. SEÇÃO: EMOJIS MULTI-ESTILO */}
      {(activeTab === "all" || activeTab === "emojis") && matchedEmojis.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-theme-text flex items-center gap-1.5">
              <Smile size={16} className="text-pink-500" />
              Emojis ({EmojiProvider.STYLES.find((s) => s.id === emojiStyle)?.label})
            </h3>
            <span className="text-xs text-theme-text-muted">
              {matchedEmojis.length} encontrados
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {matchedEmojis.map((e) => {
              const svgUrl = EmojiProvider.getSvgUrl(e.char, emojiStyle);
              return (
                <div
                  key={e.name}
                  onClick={() => handleUseEmoji(e.char, e.name)}
                  className="p-3 bg-theme-surface rounded-cute border border-theme-border/60 hover:border-theme-primary shadow-soft hover:shadow-float hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group"
                >
                  <div className="w-12 h-12 flex items-center justify-center text-3xl group-hover:scale-115 transition-transform">
                    {svgUrl ? (
                      <img src={svgUrl} alt={e.name} className="w-9 h-9 object-contain" />
                    ) : (
                      <span>{e.char}</span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-theme-text text-center truncate max-w-full">
                    {e.name}
                  </span>
                  <span className="text-[10px] text-theme-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    + Adicionar
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. SEÇÃO: FORMAS GEOMÉTRICAS */}
      {(activeTab === "all" || activeTab === "shapes") && matchedShapes.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-theme-text flex items-center gap-1.5">
              <Shapes size={16} className="text-purple-500" />
              Formas Geométricas & Elementos de Mira
            </h3>
            <span className="text-xs text-theme-text-muted">
              {matchedShapes.length} encontradas
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3">
            {matchedShapes.map((s) => (
              <div
                key={s.shape}
                onClick={() => handleUseShape(s.shape, s.name)}
                className="p-3.5 bg-theme-surface rounded-cute border border-theme-border/60 hover:border-theme-primary shadow-soft hover:shadow-float hover:-translate-y-1 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">
                    {s.shape === "heart" ? "💕" : s.shape === "star" ? "✨" : "🎯"}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-theme-text">{s.name}</span>
                    <span className="text-[10px] text-theme-text-muted">Forma vetorial</span>
                  </div>
                </div>
                <Plus size={16} className="text-theme-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. SEÇÃO: ÍCONES ICONIFY */}
      {(activeTab === "all" || activeTab === "icons") && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-theme-text flex items-center gap-1.5">
              <Sparkles size={16} className="text-cyan-500" />
              Ícones da Coleção Iconify (Phosphor, Tabler, Lucide, etc.)
            </h3>
            <span className="text-xs text-theme-text-muted">
              {loadingIcons ? "Buscando na API..." : `${iconResults.length} encontrados`}
            </span>
          </div>

          {loadingIcons ? (
            <div className="p-8 text-center text-xs text-theme-text-muted bg-theme-surface-card rounded-cute">
              Consultando mais de 300.000 ícones no Iconify... 🔍
            </div>
          ) : iconResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-theme-text-muted bg-theme-surface-card rounded-cute">
              Nenhum ícone encontrado para "{search}". Tente termos em inglês como "heart", "cat", "flower", "crosshair".
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {iconResults.map((icon) => (
                <div
                  key={icon.icon}
                  onClick={() => handleUseIcon(icon)}
                  className="p-3 bg-theme-surface rounded-cute border border-theme-border/60 hover:border-theme-primary shadow-soft hover:shadow-float hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group"
                >
                  <div className="w-10 h-10 flex items-center justify-center group-hover:scale-115 transition-transform">
                    <img
                      src={icon.svgUrl}
                      alt={icon.name}
                      className="w-7 h-7 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-theme-text truncate max-w-full">
                    {icon.name}
                  </span>
                  <span className="text-[9px] text-theme-text-muted uppercase tracking-wider font-bold">
                    {icon.collectionName}
                  </span>
                  <span className="text-[10px] text-theme-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    + Usar
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. SEÇÃO: PRESETS & MIRAS */}
      {(activeTab === "all" || activeTab === "presets") && matchedPresets.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-theme-text flex items-center gap-1.5">
              <Target size={16} className="text-rose-500" />
              Miras Prontas & Presets Artesanais
            </h3>
            <span className="text-xs text-theme-text-muted">
              {matchedPresets.length} encontrados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {matchedPresets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleUsePreset(preset)}
                className="p-3.5 bg-theme-surface rounded-cute border border-theme-border/60 hover:border-theme-primary shadow-soft hover:shadow-float hover:-translate-y-1 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#181f2f] text-white flex items-center justify-center font-bold text-lg">
                    🎯
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-theme-text">{preset.name}</span>
                    <span className="text-[10px] text-theme-text-muted line-clamp-1">{preset.description}</span>
                  </div>
                </div>
                <Button size="sm" variant="secondary">
                  Carregar
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
