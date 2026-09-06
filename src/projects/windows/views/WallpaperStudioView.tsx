import React, { useState, useEffect } from "react";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { useWindowsStore } from "../store/windowsStore";
import {
  Image,
  Search,
  Sparkles,
  Check,
  RotateCcw,
  Monitor,
  Flame,
  BookOpen,
  Heart,
  Gamepad2,
  Globe,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  EXTENDED_WALLPAPERS,
  ExtendedWallpaperItem,
  WallpaperCategory,
  WallpaperResolution,
} from "../services/wallpaperDatabase";
import { fetchWallhavenWallpapers, WallhavenItem } from "../services/wallhavenApi";

export const WallpaperStudioView: React.FC = () => {
  const { wallpaper, updateWallpaper, undoLastChange, revertCategoryToDefault } =
    useWindowsStore();

  const [viewMode, setViewMode] = useState<"online" | "curated">("online");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | WallpaperCategory>("all");
  const [selectedResolution, setSelectedResolution] = useState<"all" | WallpaperResolution>("all");
  const [selectedFit, setSelectedFit] = useState(wallpaper.fitMode);

  // Estados da Biblioteca Online (Wallhaven)
  const [onlineWallpapers, setOnlineWallpapers] = useState<WallhavenItem[]>([]);
  const [isLoadingOnline, setIsLoadingOnline] = useState(false);
  const [sortMode, setSortMode] = useState<"toplist" | "hot" | "views" | "random">("toplist");
  const [applyingId, setApplyingId] = useState<string | null>(null);

  // Tags populares de 1 clique
  const quickTags = [
    "Solo Leveling",
    "Demon Slayer",
    "Berserk",
    "Jujutsu Kaisen",
    "Tokyo Ghoul",
    "Cyberpunk",
    "Lofi Girl",
    "Ghibli",
    "Pixel Art",
  ];

  // Carrega wallpapers online ao montar ou alterar filtros
  useEffect(() => {
    if (viewMode === "online") {
      let isMounted = true;
      setIsLoadingOnline(true);
      fetchWallhavenWallpapers(searchTerm, selectedCategory as any, sortMode)
        .then((data) => {
          if (isMounted) {
            setOnlineWallpapers(data);
            setIsLoadingOnline(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsLoadingOnline(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [viewMode, selectedCategory, sortMode]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (viewMode === "online") {
      setIsLoadingOnline(true);
      fetchWallhavenWallpapers(searchTerm, selectedCategory as any, sortMode).then((data) => {
        setOnlineWallpapers(data);
        setIsLoadingOnline(false);
      });
    }
  };

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

  // Filtragem combinada da galeria curada
  const filteredCurated = EXTENDED_WALLPAPERS.filter((item) => {
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

  const handleApplyCurated = (item: ExtendedWallpaperItem) => {
    setApplyingId(item.id);
    updateWallpaper(
      {
        activeWallpaperId: item.id,
        wallpaperPath: item.previewUrl,
        fitMode: selectedFit,
      },
      `Wallpaper: ${item.title}`
    ).finally(() => setApplyingId(null));
  };

  const handleApplyOnline = (item: WallhavenItem) => {
    setApplyingId(item.id);
    updateWallpaper(
      {
        activeWallpaperId: item.id,
        wallpaperPath: item.url,
        fitMode: selectedFit,
      },
      `Wallpaper Online: ${item.id} (${item.resolution})`
    ).finally(() => setApplyingId(null));
  };

  return (
    <div className="space-y-6">
      <StudioSectionHeader
        title="Wallpaper Studio (Biblioteca Gratuita de Animes, Mangás & 4K)"
        subtitle="Explore milhões de papéis de parede online em alta resolução ou escolha itens da coleção curada para aplicar no Windows."
        icon="🖼️"
        category="wallpapers"
        compatibility="SUPPORTED"
      />

      {/* Seletor de Origem: Online Cloud vs Curado Offline */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl bg-theme-surface border border-theme-border/60">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-theme-surface-card border border-theme-border/40 w-full sm:w-auto">
          <button
            onClick={() => setViewMode("online")}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial ${
              viewMode === "online"
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-soft"
                : "text-theme-text-muted hover:text-theme-text"
            }`}
          >
            <Globe size={14} />
            <span>🌐 Biblioteca Online Gratuita (Wallhaven Cloud)</span>
          </button>

          <button
            onClick={() => setViewMode("curated")}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial ${
              viewMode === "curated"
                ? "bg-theme-primary text-white shadow-soft"
                : "text-theme-text-muted hover:text-theme-text"
            }`}
          >
            <Sparkles size={14} />
            <span>⭐ Coleção Curada Offline</span>
          </button>
        </div>

        {viewMode === "online" && (
          <div className="flex items-center gap-1.5 text-xs text-theme-text-muted">
            <span className="font-semibold text-pink-400">Ordenar:</span>
            {(["toplist", "hot", "views", "random"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSortMode(m)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                  sortMode === m
                    ? "bg-pink-500/20 text-pink-400 border border-pink-500/40"
                    : "hover:text-theme-text"
                }`}
              >
                {m === "toplist" ? "Mais Populares" : m === "hot" ? "Em Alta" : m === "views" ? "Mais Vistos" : "Aleatório"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Barra de Filtros por Categoria */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-theme-border">
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

      {/* Barra de Busca e Tags Rápidas */}
      <div className="space-y-2.5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-theme-surface border border-theme-border/60 rounded-2xl">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                viewMode === "online"
                  ? "Buscar na biblioteca gratuita (ex: solo leveling, demon slayer, lofi, cyberpunk)..."
                  : "Filtrar por nome ou tag local..."
              }
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-theme-surface-card border border-theme-border text-xs text-theme-text placeholder-theme-text-muted focus:outline-hidden focus:border-pink-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 shadow-soft transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={13} />
            <span>Buscar</span>
          </button>
        </form>

        {/* Tags Rápidas de 1 clique */}
        {viewMode === "online" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-theme-text-muted font-bold whitespace-nowrap pl-1">Tags Rápidas:</span>
            {quickTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchTerm(tag);
                  setIsLoadingOnline(true);
                  fetchWallhavenWallpapers(tag, selectedCategory as any, sortMode).then((data) => {
                    setOnlineWallpapers(data);
                    setIsLoadingOnline(false);
                  });
                }}
                className="px-2.5 py-1 rounded-lg bg-theme-surface hover:bg-pink-500/20 text-theme-text-muted hover:text-pink-400 border border-theme-border/60 whitespace-nowrap transition-all"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grade de Exibição de Wallpapers */}
      {viewMode === "online" ? (
        <div>
          {isLoadingOnline ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 size={32} className="animate-spin text-pink-500" />
              <p className="text-xs text-theme-text-muted">Carregando catálogo de wallpapers em alta definição...</p>
            </div>
          ) : onlineWallpapers.length === 0 ? (
            <div className="text-center py-16 p-6 rounded-3xl bg-theme-surface border border-theme-border/40 space-y-2">
              <p className="text-sm font-bold text-theme-text">Nenhum wallpaper encontrado para "{searchTerm}"</p>
              <p className="text-xs text-theme-text-muted">Tente buscar por termos como "anime", "cyberpunk", "manga" ou clique nas tags rápidas acima.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {onlineWallpapers.map((item) => {
                const isActive = wallpaper.wallpaperPath === item.url;
                const isApplying = applyingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 bg-theme-surface ${
                      isActive
                        ? "border-pink-500 ring-2 ring-pink-500/40 shadow-soft"
                        : "border-theme-border/60 hover:border-theme-primary/50"
                    }`}
                  >
                    <div className="relative aspect-video overflow-hidden bg-slate-950">
                      <img
                        src={item.thumbnail}
                        alt={`Wallpaper ${item.id}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/20">
                          {item.resolution}
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                        <span className="text-[11px] text-white/80 font-medium">#{item.id}</span>
                        <button
                          onClick={() => handleApplyOnline(item)}
                          disabled={isApplying}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 shadow-soft transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          {isApplying ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              <span>Baixando...</span>
                            </>
                          ) : isActive ? (
                            <>
                              <Check size={12} />
                              <span>Ativo</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={12} />
                              <span>Aplicar 4K</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Modo Coleção Curada */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCurated.map((item) => {
            const isActive = wallpaper.activeWallpaperId === item.id;
            const isApplying = applyingId === item.id;

            return (
              <div
                key={item.id}
                className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 bg-theme-surface ${
                  isActive
                    ? "border-theme-primary ring-2 ring-theme-primary/30 shadow-soft"
                    : "border-theme-border/60 hover:border-theme-primary/50"
                }`}
              >
                <div className="relative aspect-video overflow-hidden bg-slate-950">
                  <img
                    src={item.previewUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/20">
                      {item.resolution.toUpperCase()}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                    <span className="text-[11px] text-white/80 font-medium truncate">{item.title}</span>
                    <button
                      onClick={() => handleApplyCurated(item)}
                      disabled={isApplying}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 shadow-soft transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      {isApplying ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>Aplicando...</span>
                        </>
                      ) : isActive ? (
                        <>
                          <Check size={12} />
                          <span>Ativo</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          <span>Aplicar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 border-t border-theme-border/40">
                  <div className="text-xs font-bold text-theme-text truncate">{item.title}</div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-theme-text-muted">
                    {item.tags.slice(0, 3).map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded-md bg-theme-surface-card border border-theme-border/40">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botão de Desfazer Wallpaper */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-theme-surface border border-theme-border/60">
        <div>
          <div className="text-xs font-bold text-theme-text">Precisa restaurar?</div>
          <div className="text-[11px] text-theme-text-muted">Desfaça a última alteração ou volte para o wallpaper original do Windows.</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => undoLastChange()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-pink-500 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition-all active:scale-95"
          >
            <RotateCcw size={14} />
            <span>Desfazer Wallpaper</span>
          </button>

          <button
            onClick={() => revertCategoryToDefault("wallpapers")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-theme-text-muted bg-theme-surface-card hover:bg-theme-border/50 border border-theme-border transition-all active:scale-95"
          >
            <span>Restaurar Padrão</span>
          </button>
        </div>
      </div>
    </div>
  );
};
