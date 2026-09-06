import React, { useState } from "react";
import { useCrosshairStore } from "../store/crosshairStore";
import { PROCEDURAL_PRESETS, generateRandomCrosshair } from "../engine/procedural-presets";
import { CrosshairItem } from "../types";
import { CrosshairRenderer } from "../engine/renderer";
import { Button } from "@/core/components/Button";
import {
  Heart,
  Search,
  Dices,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Clock,
  FolderHeart,
} from "lucide-react";
import { useToast } from "@/core/components/Toast";

interface GalleryProps {
  onSelect: (item: CrosshairItem) => void;
  onOpenImport: () => void;
  onOpenExport: () => void;
}

export const CrosshairGallery: React.FC<GalleryProps> = ({
  onSelect,
  onOpenImport,
  onOpenExport,
}) => {
  const {
    activeCrosshair,
    savedCrosshairs,
    favorites,
    history,
    toggleFavorite,
    setActiveCrosshair,
    deleteCrosshair,
  } = useCrosshairStore();

  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const allItems: CrosshairItem[] = [...savedCrosshairs, ...PROCEDURAL_PRESETS];

  const handleSurpriseMe = () => {
    const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
    setActiveCrosshair(randomItem);
    onSelect(randomItem);
    addToast(`Escolhemos "${randomItem.name}" para você! ✨`, "sparkle");
  };

  const handleGenerateRandom = () => {
    const procedural = generateRandomCrosshair();
    setActiveCrosshair(procedural);
    onSelect(procedural);
    addToast("Uma mira nova foi gerada proceduralmente! 💗", "love");
  };

  const filteredItems = allItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterCategory === "all") return true;
    if (filterCategory === "favs") return favorites.includes(item.id);
    if (filterCategory === "my") return savedCrosshairs.some((s) => s.id === item.id);
    if (filterCategory === "history") return history.some((h) => h.id === item.id);
    if (filterCategory === "cute") return item.category === "Cute";
    if (filterCategory === "competitive") return item.category === "Competitive";
    if (filterCategory === "dot") return item.category === "Dot";
    if (filterCategory === "circle") return item.category === "Circle";

    return true;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar miras por nome ou tags..."
            className="w-full h-10 pl-10 pr-4 text-xs bg-theme-surface-card border border-theme-border rounded-cute text-theme-text focus:outline-none focus:border-theme-primary transition-colors shadow-xs"
          />
        </div>

        {/* Fun Generators */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Dices size={15} className="text-purple-500" />}
            onClick={handleSurpriseMe}
            title="Escolhe uma mira aleatória da biblioteca"
          >
            Me surpreenda 🎲
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Sparkles size={15} className="text-amber-500" />}
            onClick={handleGenerateRandom}
            title="Cria uma combinação procedural inédita"
          >
            Gerar Aleatória ✨
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenImport}
          >
            Importar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenExport}
          >
            Exportar
          </Button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: "all", label: "Todas as Miras" },
          { id: "favs", label: "Favoritas ❤️" },
          { id: "my", label: "Minhas Miras 📁" },
          { id: "cute", label: "Fofinhas 💕" },
          { id: "competitive", label: "Competitivas 🎯" },
          { id: "dot", label: "Pontos" },
          { id: "circle", label: "Círculos" },
          { id: "history", label: "Recentes 🕒" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap border transition-all ${
              filterCategory === cat.id
                ? "bg-theme-primary text-white border-theme-primary font-medium shadow-soft"
                : "bg-theme-surface-card border-theme-border/60 text-theme-text-muted hover:text-theme-text"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Crosshairs Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3 bg-theme-surface rounded-cute border border-theme-border/60">
          <FolderHeart size={36} className="text-theme-primary/40" />
          <p className="text-sm font-medium text-theme-text">
            Você ainda não salvou nenhuma mira nessa categoria 💗
          </p>
          <Button variant="secondary" size="sm" onClick={() => setFilterCategory("all")}>
            Explorar todas as miras
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => {
            const isFav = favorites.includes(item.id);
            const isActive = activeCrosshair.id === item.id;
            const isCustom = savedCrosshairs.some((s) => s.id === item.id);

            return (
              <div
                key={item.id}
                onClick={() => {
                  setActiveCrosshair(item);
                  onSelect(item);
                }}
                className={`group relative flex flex-col bg-theme-surface rounded-cute border p-3 cursor-pointer shadow-soft hover:shadow-float hover:-translate-y-1 transition-all ${
                  isActive
                    ? "border-theme-primary ring-2 ring-theme-primary/20"
                    : "border-theme-border/60 hover:border-theme-primary/40"
                }`}
              >
                {/* Preview Canvas Thumbnail */}
                <div className="w-full h-28 bg-[#181f2f] rounded-xl flex items-center justify-center relative overflow-hidden mb-2.5">
                  <CrosshairThumbnail item={item} />

                  {/* Favorite Heart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${
                      isFav
                        ? "bg-white/80 text-pink-500 fill-pink-500 shadow-sm"
                        : "bg-black/30 text-white/70 hover:text-white"
                    }`}
                  >
                    <Heart size={14} className={isFav ? "fill-pink-500" : ""} />
                  </button>

                  {/* Delete button if user custom */}
                  {isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCrosshair(item.id);
                        addToast("Mira removida.", "warning");
                      }}
                      className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/40 text-white/70 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Excluir"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-theme-text truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-theme-text-muted line-clamp-1">
                    {item.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CrosshairThumbnail: React.FC<{ item: CrosshairItem }> = ({ item }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    CrosshairRenderer.renderToCanvas(ctx, item, 120, 120, 1.2);
  }, [item]);

  return <canvas ref={canvasRef} width={120} height={120} className="pointer-events-none" />;
};
