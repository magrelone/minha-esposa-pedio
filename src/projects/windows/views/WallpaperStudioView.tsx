import React, { useState } from "react";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { useWindowsStore } from "../store/windowsStore";
import {
  Image,
  Search,
  Filter,
  Sparkles,
  Check,
  RotateCcw,
  Monitor,
  Flame,
  BookOpen,
  Heart,
  Gamepad2,
} from "lucide-react";
import {
  EXTENDED_WALLPAPERS,
  ExtendedWallpaperItem,
  WallpaperCategory,
  WallpaperResolution,
} from "../services/wallpaperDatabase";

export const WallpaperStudioView: React.FC = () => {
  const { wallpaper, updateWallpaper, undoLastChange, revertCategoryToDefault } =
    useWindowsStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | WallpaperCategory>("all");
  const [selectedResolution, setSelectedResolution] = useState<"all" | WallpaperResolution>("all");
  const [selectedFit, setSelectedFit] = useState(wallpaper.fitMode);

  // Categorias com ícones temáticos
  const categoryFilters: { id: "all" | WallpaperCategory; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "Todos", icon: <Image size={14} /> },
    { id: "anime", label: "Animes", icon: <Sparkles size={14} className="text-pink-400" /> },
    { id: "manga", label: "Mangás (P&B)", icon: <BookOpen size={14} className="text-slate-300" /> },
    { id: "manhwa", label: "Manhwas", icon: <Flame size={14} className="text-blue-400" /> },
    { id: "cute", label: "Cute 💕", icon: <Heart size={14} className="text-rose-400 fill-rose-400" /> },
    { id: "gaming", label: "Gaming", icon: <Gamepad2 size={14} className="text-amber-400" /> },
    { id: "minimal", label: "Minimalista", icon: <Monitor size={14} className="text-purple-400" /> },
  ];

  const resolutionFilters: { id: "all" | WallpaperResolution; label: string }[] = [
    { id: "all", label: "Todas Resoluções" },
    { id: "4k", label: "4K UHD" },
    { id: "1080p", label: "1080p" },
    { id: "ultrawide", label: "Ultrawide 21:9" },
  ];

  // Filtragem combinada em tempo real
  const filteredWallpapers = EXTENDED_WALLPAPERS.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    if (selectedResolution !== "all" && item.resolution !== selectedResolution) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(term);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(term));
      if (!matchTitle && !matchTags) return false;
    }
    return true;
  });

  const handleApplyWallpaper = (item: ExtendedWallpaperItem) => {
    updateWallpaper(
      {
        activeWallpaperId: item.id,
        wallpaperPath: item.previewUrl,
        fitMode: selectedFit,
      },
      `Wallpaper: ${item.title}`
    );
  };

  return (
    <div className="space-y-6">
      <StudioSectionHeader
        title="Wallpaper Studio (Animes, Mangás, Manhwas & Cute)"
        subtitle="Banco expandido de papéis de parede em 4K com filtros temáticos, busca por tags e aplicação nativa."
        icon="🖼️"
        category="wallpapers"
        compatibility="SUPPORTED"
      />

      {/* Barra de Filtros por Categoria */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-theme-border">
        {categoryFilters.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                isSelected
                  ? "bg-theme-primary text-white shadow-soft"
                  : "bg-theme-surface hover:bg-theme-surface-card text-theme-text-muted hover:text-theme-text border border-theme-border/60"
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Barra de Busca e Resolução */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 bg-theme-surface border border-theme-border/60 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por tema, mangá, personagem ou tag (ex: solo leveling, lofi, sakura, rain)..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-theme-surface-card border border-theme-border text-xs text-theme-text placeholder-theme-text-muted focus:outline-hidden focus:border-pink-500 transition-colors"
          />
        </div>

        {/* Filtro de Resolução */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {resolutionFilters.map((res) => {
            const isSelected = selectedResolution === res.id;
            return (
              <button
                key={res.id}
                onClick={() => setSelectedResolution(res.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-pink-500 text-white font-bold shadow-xs"
                    : "bg-theme-surface-card text-theme-text-muted hover:text-theme-text border border-theme-border/50"
                }`}
              >
                {res.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contador de Resultados */}
      <div className="flex items-center justify-between px-1 text-xs text-theme-text-muted font-medium">
        <span>Exibindo {filteredWallpapers.length} papel(is) de parede</span>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-pink-500 hover:underline text-[11px]"
          >
            Limpar busca
          </button>
        )}
      </div>

      {/* Grade de Wallpapers */}
      {filteredWallpapers.length === 0 ? (
        <div className="p-12 text-center text-xs text-theme-text-muted bg-theme-surface rounded-2xl border border-theme-border/60">
          Nenhum papel de parede encontrado com esses filtros. Tente outra categoria ou termo de busca!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWallpapers.map((item) => {
            const isCurrent = wallpaper.activeWallpaperId === item.id;
            return (
              <div
                key={item.id}
                className={`group flex flex-col justify-between bg-theme-surface border rounded-2xl overflow-hidden p-4 transition-all duration-300 hover:shadow-soft ${
                  isCurrent
                    ? "border-pink-500 shadow-soft ring-1 ring-pink-500/50"
                    : "border-theme-border/60 hover:border-pink-500/40"
                }`}
              >
                {/* Preview de Imagem */}
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-900/60 mb-3">
                  <img
                    src={item.previewUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {isCurrent && (
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-pink-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                      <Check size={12} /> EM USO
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-black/70 text-pink-300 backdrop-blur-md">
                      {item.categoryLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                      {item.resolutionLabel}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-black/60 text-white/80 backdrop-blur-md">
                    {item.license.licenseName}
                  </div>
                </div>

                {/* Informações */}
                <div>
                  <h4 className="text-xs font-bold text-theme-text group-hover:text-pink-400 transition-colors truncate">
                    {item.title}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {item.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        onClick={() => setSearchTerm(tag)}
                        className="text-[10px] text-theme-text-muted bg-theme-surface-card hover:text-pink-400 px-1.5 py-0.5 rounded-md cursor-pointer transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-2 mt-4 pt-2 border-t border-theme-border/40">
                  <button
                    onClick={() => handleApplyWallpaper(item)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 shadow-soft active:scale-95 transition-all"
                  >
                    Definir no Windows
                  </button>

                  <button
                    onClick={() => undoLastChange()}
                    className="p-2 rounded-xl text-theme-text-muted hover:text-pink-500 bg-theme-surface-card hover:bg-theme-border/50 border border-theme-border transition-colors active:scale-95"
                    title="Desfazer este wallpaper"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Barra de Ações Rápidas de Rollback */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-theme-surface border border-theme-border/60 rounded-2xl">
        <div className="text-xs text-theme-text-muted">
          Quer retornar ao papel de parede padrão original do Windows?
        </div>

        <button
          onClick={() => revertCategoryToDefault("wallpapers")}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-pink-500 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition-all active:scale-95"
        >
          <RotateCcw size={13} />
          <span>Restaurar Wallpaper Padrão do Windows</span>
        </button>
      </div>
    </div>
  );
};
