import React, { useState } from "react";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { useWindowsStore } from "../store/windowsStore";
import { Image, Monitor, Check, RotateCcw } from "lucide-react";
import { INITIAL_SEED_ASSETS } from "../services/licenseService";

export const WallpaperStudioView: React.FC = () => {
  const { wallpaper, updateWallpaper, undoLastChange, revertCategoryToDefault } = useWindowsStore();
  const [selectedFit, setSelectedFit] = useState(wallpaper.fitMode);

  const wallpaperAssets = INITIAL_SEED_ASSETS.filter((a) => a.type === "wallpaper");

  const handleApplyWallpaper = (asset: (typeof wallpaperAssets)[0]) => {
    updateWallpaper(
      {
        activeWallpaperId: asset.id,
        wallpaperPath: asset.previewUrl,
        fitMode: selectedFit,
      },
      `Wallpaper: ${asset.title}`
    );
  };

  return (
    <div className="space-y-6">
      <StudioSectionHeader
        title="Wallpaper Studio (Papéis de Parede)"
        subtitle="Escolha entre wallpapers estáticos de alta resolução com licença verificada e restauração instantânea."
        icon="🖼️"
        category="wallpapers"
        compatibility="SUPPORTED"
      />

      {/* Galeria de Wallpapers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {wallpaperAssets.map((asset) => {
          const isCurrent = wallpaper.activeWallpaperId === asset.id;
          return (
            <div
              key={asset.id}
              className={`group flex flex-col justify-between bg-theme-surface border rounded-2xl overflow-hidden p-4 transition-all duration-300 hover:shadow-soft ${
                isCurrent ? "border-pink-500 shadow-soft" : "border-theme-border/60 hover:border-pink-500/40"
              }`}
            >
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-900/50 mb-3">
                <img
                  src={asset.previewUrl}
                  alt={asset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {isCurrent && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-pink-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                    <Check size={12} /> ATIVO
                  </div>
                )}
                <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-md">
                  {asset.license.licenseName}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-theme-text">{asset.title}</h4>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {asset.tags.map((tag) => (
                    <span key={tag} className="text-[10px] text-theme-text-muted bg-theme-surface-card px-1.5 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-2 border-t border-theme-border/40">
                <button
                  onClick={() => handleApplyWallpaper(asset)}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 shadow-soft active:scale-95 transition-all"
                >
                  Definir Wallpaper
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

      {/* Barra de Ações Rápidas de Rollback */}
      <div className="flex items-center justify-between p-4 bg-theme-surface border border-theme-border/60 rounded-2xl">
        <div className="text-xs text-theme-text-muted">
          Quer voltar ao papel de parede oficial do Windows?
        </div>

        <button
          onClick={() => revertCategoryToDefault("wallpapers")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-pink-500 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition-all active:scale-95"
        >
          <RotateCcw size={13} />
          <span>Restaurar Wallpaper Padrão do Windows</span>
        </button>
      </div>
    </div>
  );
};
