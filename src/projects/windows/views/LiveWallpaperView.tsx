import React from "react";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { useWindowsStore } from "../store/windowsStore";
import { Film, Play, Pause, BatteryCharging, ShieldAlert, Cpu } from "lucide-react";

export const LiveWallpaperView: React.FC = () => {
  const { wallpaper, updateWallpaper, undoLastChange } = useWindowsStore();

  const handleToggleLive = (enable: boolean) => {
    updateWallpaper(
      { isLive: enable },
      enable ? "Live Wallpaper Ativado" : "Live Wallpaper Desativado"
    );
  };

  return (
    <div className="space-y-6">
      <StudioSectionHeader
        title="Live Wallpaper Studio (Papéis de Parede Animados)"
        subtitle="Wallpapers animados em vídeo e GIFs com auto-pause em jogos e economia de bateria."
        icon="🎞️"
        category="live_wallpapers"
        compatibility="EXPERIMENTAL"
      />

      {/* Painel de Controle do Motor */}
      <div className="bg-theme-surface border border-theme-border/60 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
              <Film size={16} className="text-pink-500" />
              <span>Estado do Live Engine</span>
            </h3>
            <p className="text-xs text-theme-text-muted mt-0.5">
              Renderiza animações e vídeos sem travamentos usando aceleração gráfica.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleLive(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                wallpaper.isLive
                  ? "bg-pink-500 text-white shadow-soft"
                  : "bg-theme-surface-card border border-theme-border text-theme-text hover:border-pink-500/40"
              }`}
            >
              <Play size={14} />
              <span>Ativar Live</span>
            </button>

            <button
              onClick={() => handleToggleLive(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                !wallpaper.isLive
                  ? "bg-theme-primary text-white shadow-soft"
                  : "bg-theme-surface-card border border-theme-border text-theme-text hover:border-theme-primary/40"
              }`}
            >
              <Pause size={14} />
              <span>Pausar</span>
            </button>
          </div>
        </div>

        {/* Otimizações de Desempenho Críticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-theme-border/40">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-theme-surface-card border border-theme-border/50">
            <div className="flex items-center gap-2.5">
              <Cpu size={16} className="text-blue-400" />
              <div>
                <div className="text-xs font-bold text-theme-text">Pausar em Jogos / Tela Cheia</div>
                <div className="text-[11px] text-theme-text-muted">Libera 100% da GPU para o seu jogo</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={wallpaper.pauseWhenFullscreen}
              onChange={(e) =>
                updateWallpaper(
                  { pauseWhenFullscreen: e.target.checked },
                  "Pausa de Live Wallpaper em Jogos"
                )
              }
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-theme-surface-card border border-theme-border/50">
            <div className="flex items-center gap-2.5">
              <BatteryCharging size={16} className="text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-theme-text">Pausar na Bateria</div>
                <div className="text-[11px] text-theme-text-muted">Economiza energia ao desconectar da tomada</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={wallpaper.pauseOnBattery}
              onChange={(e) =>
                updateWallpaper(
                  { pauseOnBattery: e.target.checked },
                  "Pausa de Live Wallpaper na Bateria"
                )
              }
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Botão de Desfazer desta seção */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => undoLastChange()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-pink-500 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition-all active:scale-95"
          >
            <span>↩️ Desfazer ajustes de Live Wallpaper</span>
          </button>
        </div>
      </div>
    </div>
  );
};
