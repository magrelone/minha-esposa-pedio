import React from "react";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { useWindowsStore } from "../store/windowsStore";
import { MousePointer, Check, RotateCcw } from "lucide-react";

export const CursorStudioView: React.FC = () => {
  const { cursor, updateCursor, undoLastChange, revertCategoryToDefault } = useWindowsStore();

  const cursorPacks = [
    {
      id: "windows_default",
      name: "Windows Aero Padrão",
      desc: "O ponteiro branco clássico e nítido do Windows.",
      badge: "Padrão Oficial",
      previewEmoji: "🖱️",
    },
    {
      id: "neko_paw",
      name: "Neko Paw Pink 💕",
      desc: "Patinha animada fofa com brilho sutil ao clicar.",
      badge: "Cute Esposa",
      previewEmoji: "🐾",
    },
    {
      id: "neon_gaming",
      name: "Neon Cyberpunk Glow",
      desc: "Ponteiro afiado ciano com traço futurista de alta precisão.",
      badge: "Gaming 144Hz",
      previewEmoji: "⚡",
    },
    {
      id: "pixel_retro",
      name: "Pixel 8-Bit Retro",
      desc: "Nostalgia dos jogos clássicos e Windows 95 em pixels.",
      badge: "Retro",
      previewEmoji: "🕹️",
    },
  ];

  return (
    <div className="space-y-6">
      <StudioSectionHeader
        title="Cursor Studio (Esquemas de Ponteiro do Mouse)"
        subtitle="Alterne esquemas de cursor sem reiniciar a máquina e reverta aos padrões com 1 clique."
        icon="🖱️"
        category="cursors"
        compatibility="SUPPORTED"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cursorPacks.map((pack) => {
          const isSelected = cursor.activePackId === pack.id;
          return (
            <div
              key={pack.id}
              className={`flex flex-col justify-between p-4.5 rounded-2xl border transition-all duration-200 ${
                isSelected
                  ? "bg-theme-primary/10 border-theme-primary shadow-soft"
                  : "bg-theme-surface border-theme-border/60 hover:border-theme-primary/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{pack.previewEmoji}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-theme-surface-card border border-theme-border text-theme-text-muted">
                    {pack.badge}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-theme-text">{pack.name}</h4>
                <p className="text-[11px] text-theme-text-muted mt-1 leading-relaxed">{pack.desc}</p>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-theme-border/40">
                <button
                  onClick={() =>
                    updateCursor(
                      { activePackId: pack.id, packName: pack.name },
                      `Cursor: ${pack.name}`
                    )
                  }
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    isSelected
                      ? "bg-emerald-500 text-white shadow-soft"
                      : "bg-theme-surface-card hover:bg-pink-500 hover:text-white border border-theme-border text-theme-text"
                  }`}
                >
                  {isSelected ? "Em Uso" : "Aplicar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between p-4 bg-theme-surface border border-theme-border/60 rounded-2xl">
        <div className="text-xs text-theme-text-muted">
          Ponteiro desalinhado ou quer voltar ao original?
        </div>

        <button
          onClick={() => revertCategoryToDefault("cursors")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-pink-500 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition-all active:scale-95"
        >
          <RotateCcw size={13} />
          <span>Restaurar Cursores Padrão do Windows</span>
        </button>
      </div>
    </div>
  );
};
