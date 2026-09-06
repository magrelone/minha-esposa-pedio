import React, { useState, useEffect } from "react";
import { useCrosshairStore } from "../store/crosshairStore";
import { IconLayer } from "../types";
import { IconifyProvider, IconifyResult, POPULAR_COLLECTIONS } from "@/core/providers/iconifyProvider";
import { useToast } from "@/core/components/Toast";
import { Search, Sparkles, Filter } from "lucide-react";

export const IconPicker: React.FC = () => {
  const { addLayer } = useCrosshairStore();
  const { addToast } = useToast();
  const [search, setSearch] = useState("heart");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [icons, setIcons] = useState<IconifyResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      if (!search.trim()) return;
      setLoading(true);
      const results = await IconifyProvider.search(search, selectedCollection, 32);
      if (active) {
        setIcons(results);
        setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, selectedCollection]);

  const handleSelectIcon = (icon: IconifyResult) => {
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
      strokeWidth: 2,
    };
    addLayer(layer);
    addToast(`Ícone "${icon.name}" adicionado à mira! ✨`, "sparkle");
  };

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Search Input & Collection Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar 300k+ ícones (heart, star, cat, target, flower...)"
            className="w-full h-10 pl-9 pr-3 text-xs bg-theme-surface-card border border-theme-border rounded-xl text-theme-text focus:outline-none focus:border-theme-primary transition-colors"
          />
        </div>

        <select
          value={selectedCollection}
          onChange={(e) => setSelectedCollection(e.target.value)}
          className="bg-theme-surface-card border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text focus:outline-none"
        >
          {POPULAR_COLLECTIONS.map((c) => (
            <option key={c.id} value={c.prefix}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Filter Tags */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {["heart", "star", "cat", "flower", "crosshair", "target", "sword", "shield", "skull"].map(
          (tag) => (
            <button
              key={tag}
              onClick={() => setSearch(tag)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                search === tag
                  ? "bg-theme-primary text-white border-theme-primary"
                  : "bg-theme-surface-card border-theme-border/40 text-theme-text-muted hover:text-theme-text"
              }`}
            >
              #{tag}
            </button>
          )
        )}
      </div>

      {/* Icon Grid */}
      <div className="bg-theme-surface-card p-4 rounded-cute border border-theme-border/60 min-h-[220px]">
        {loading ? (
          <div className="p-8 text-center text-xs text-theme-text-muted flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-theme-primary animate-spin" />
            <span>Consultando banco de ícones...</span>
          </div>
        ) : icons.length === 0 ? (
          <div className="p-8 text-center text-xs text-theme-text-muted">
            Nenhum ícone encontrado para "{search}". Tente termos em inglês (heart, flower, target...).
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
            {icons.map((icon) => (
              <button
                key={icon.icon}
                onClick={() => handleSelectIcon(icon)}
                className="p-2.5 rounded-xl bg-theme-surface hover:bg-theme-primary-light border border-theme-border/40 hover:border-theme-primary text-theme-text hover:text-theme-primary shadow-xs hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 group"
                title={`${icon.name} (${icon.collectionName})`}
              >
                <img
                  src={icon.svgUrl}
                  alt={icon.name}
                  className="w-6 h-6 object-contain pointer-events-none group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
                <span className="text-[10px] truncate max-w-full font-medium">
                  {icon.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="text-[11px] text-theme-text-muted text-center flex items-center justify-center gap-1">
        <span>✨ Integração com Iconify (Phosphor, Tabler, Lucide, Heroicons, Bootstrap e mais)</span>
      </div>
    </div>
  );
};
