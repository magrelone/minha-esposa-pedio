import React from "react";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { useWindowsStore } from "../store/windowsStore";
import { Folder, Sparkles, RotateCcw } from "lucide-react";

export const FolderStudioView: React.FC = () => {
  const { undoLastChange, showNotification } = useWindowsStore();

  const folderPacks = [
    {
      id: "pastel_candy",
      name: "Pastel Candy Folders 💕",
      desc: "Pastas em tons suaves de rosa, lilás e menta para uma área de trabalho graciosa.",
      badge: "Cute Esposa",
      colors: ["#f472b6", "#c084fc", "#67e8f9", "#fde047"],
    },
    {
      id: "fluent_win11",
      name: "Fluent Colored Folders",
      desc: "Estilo oficial do Windows 11 com categorização por cores para documentos e projetos.",
      badge: "Moderno",
      colors: ["#3b82f6", "#10b981", "#f97316", "#ef4444"],
    },
    {
      id: "retro_xp",
      name: "Windows XP Classic Yellow",
      desc: "As icônicas pastas amarelas com relevo nostálgico dos anos 2000.",
      badge: "Retro",
      colors: ["#eab308", "#ca8a04", "#a16207"],
    },
  ];

  return (
    <div className="space-y-6">
      <StudioSectionHeader
        title="Folder Studio & Packs (Personalização de Pastas)"
        subtitle="Atribua cores e temas para pastas de documentos, projetos e jogos com reversão segura."
        icon="📂"
        category="folders"
        compatibility="SUPPORTED"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {folderPacks.map((pack) => (
          <div
            key={pack.id}
            className="flex flex-col justify-between p-4.5 rounded-2xl bg-theme-surface border border-theme-border/60 hover:border-pink-500/40 transition-all shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-theme-text">{pack.name}</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-theme-surface-card border border-theme-border text-theme-text-muted">
                  {pack.badge}
                </span>
              </div>
              <p className="text-[11px] text-theme-text-muted leading-relaxed">{pack.desc}</p>

              <div className="flex items-center gap-1.5 mt-3">
                {pack.colors.map((c, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-lg border border-white/20 shadow-xs"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-theme-border/40">
              <button
                onClick={() => showNotification(`📂 Pacote ${pack.name} aplicado com sucesso!`)}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-pink-500 hover:opacity-95 shadow-soft active:scale-95 transition-all"
              >
                Aplicar Pacote
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-4 bg-theme-surface border border-theme-border/60 rounded-2xl">
        <div className="text-xs text-theme-text-muted">
          Quer restaurar os ícones amarelos padrão em todas as pastas?
        </div>

        <button
          onClick={() => {
            showNotification("Restaurado ícones de pasta originais do Windows");
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-pink-500 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition-all active:scale-95"
        >
          <RotateCcw size={13} />
          <span>Restaurar Pastas Originais</span>
        </button>
      </div>
    </div>
  );
};
