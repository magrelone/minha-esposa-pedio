import React from "react";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { useWindowsStore } from "../store/windowsStore";
import { Volume2, VolumeX, RotateCcw, Play, Check } from "lucide-react";

export const SoundStudioView: React.FC = () => {
  const { sound, updateSound, undoLastChange, revertCategoryToDefault } = useWindowsStore();

  const soundPacks = [
    {
      id: "windows_default",
      name: "Windows 11 Fluent Sound",
      desc: "Sons suaves, acústicos e modernos da Microsoft.",
      badge: "Padrão Oficial",
    },
    {
      id: "cute_melody",
      name: "Cute Chimes & Bell 💕",
      desc: "Campainhas doces e sininhos carinhosos para cada notificação.",
      badge: "Favorito Esposa",
    },
    {
      id: "xp_classic",
      name: "Windows XP Nostalgia 2001",
      desc: "O icônico som de inicialização e alertas clássicos da era dourada.",
      badge: "Nostalgia",
    },
    {
      id: "silent_zen",
      name: "Zen Mudo (Sem Alertas Sonoros)",
      desc: "Desativa avisos sonoros que interrompem suas reuniões ou foco.",
      badge: "Produtividade",
    },
  ];

  return (
    <div className="space-y-6">
      <StudioSectionHeader
        title="Sound Studio (Esquemas de Sons do Windows)"
        subtitle="Personalize avisos, conexão de dispositivos e inicialização com reversão garantida."
        icon="🔊"
        category="sounds"
        compatibility="SUPPORTED"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {soundPacks.map((pack) => {
          const isSelected = sound.activePackId === pack.id;
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
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-theme-text">{pack.name}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-theme-surface-card border border-theme-border text-theme-text-muted">
                    {pack.badge}
                  </span>
                </div>
                <p className="text-[11px] text-theme-text-muted leading-relaxed">{pack.desc}</p>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-theme-border/40">
                <button
                  onClick={() =>
                    updateSound(
                      { activePackId: pack.id, packName: pack.name },
                      `Som: ${pack.name}`
                    )
                  }
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    isSelected
                      ? "bg-emerald-500 text-white shadow-soft"
                      : "bg-theme-surface-card hover:bg-pink-500 hover:text-white border border-theme-border text-theme-text"
                  }`}
                >
                  {isSelected ? "Esquema Ativo" : "Aplicar Esquema"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between p-4 bg-theme-surface border border-theme-border/60 rounded-2xl">
        <div className="text-xs text-theme-text-muted">
          Deseja retornar ao esquema de áudio original do Windows?
        </div>

        <button
          onClick={() => revertCategoryToDefault("sounds")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-pink-500 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition-all active:scale-95"
        >
          <RotateCcw size={13} />
          <span>Restaurar Sons Padrão do Windows</span>
        </button>
      </div>
    </div>
  );
};
