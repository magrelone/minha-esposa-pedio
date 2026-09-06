import React from "react";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { useWindowsStore } from "../store/windowsStore";
import { Compass, Sparkles, Sliders, ShieldCheck } from "lucide-react";

export const StartMenuView: React.FC = () => {
  const { startMenu, updateStartMenu, undoLastChange } = useWindowsStore();

  const layouts = [
    { id: "windows11", name: "Windows 11 Fluent", desc: "Grade moderna com pesquisa no topo" },
    { id: "windows10", name: "Windows 10 Híbrido", desc: "Lista vertical com blocos clássicos" },
    { id: "windows7", name: "Windows 7 Clássico", desc: "Duas colunas compactas de programas" },
    { id: "minimal", name: "Minimalista", desc: "Apenas aplicativos favoritos e barra de busca" },
  ];

  return (
    <div className="space-y-6">
      <StudioSectionHeader
        title="Start Menu Studio (Menu Iniciar)"
        subtitle="Escolha o layout de menu iniciar e controle arquivos recomendados de forma segura."
        icon="🚀"
        category="start_menu"
        compatibility="SUPPORTED"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {layouts.map((layout) => {
          const isSelected = startMenu.layout === layout.id;
          return (
            <div
              key={layout.id}
              onClick={() => updateStartMenu({ layout: layout.id as any }, `Layout Start: ${layout.name}`)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "bg-theme-primary/10 border-theme-primary shadow-soft scale-[1.02]"
                  : "bg-theme-surface border-theme-border/60 hover:border-theme-primary/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-theme-text">{layout.name}</span>
                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-sm" />}
              </div>
              <p className="text-[11px] text-theme-text-muted leading-relaxed">{layout.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-theme-surface border border-theme-border/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
          <Sliders size={16} className="text-pink-500" />
          <span>Preferências de Privacidade e Exibição</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-theme-surface-card border border-theme-border/50">
            <div>
              <div className="text-xs font-bold text-theme-text">Arquivos Recentes</div>
              <div className="text-[11px] text-theme-text-muted">Mostra documentos abertos recentemente</div>
            </div>
            <input
              type="checkbox"
              checked={startMenu.showRecentFiles}
              onChange={(e) =>
                updateStartMenu({ showRecentFiles: e.target.checked }, "Arquivos Recentes no Start")
              }
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-theme-surface-card border border-theme-border/50">
            <div>
              <div className="text-xs font-bold text-theme-text">Seção Recomendados</div>
              <div className="text-[11px] text-theme-text-muted">Sugestões de aplicativos do sistema</div>
            </div>
            <input
              type="checkbox"
              checked={startMenu.showRecommended}
              onChange={(e) =>
                updateStartMenu({ showRecommended: e.target.checked }, "Recomendados no Start")
              }
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-theme-surface-card border border-theme-border/50">
            <div>
              <div className="text-xs font-bold text-theme-text">Atalhos de Energia</div>
              <div className="text-[11px] text-theme-text-muted">Botões rápidos de desligar e suspender</div>
            </div>
            <input
              type="checkbox"
              checked={startMenu.showPowerShortcuts}
              onChange={(e) =>
                updateStartMenu({ showPowerShortcuts: e.target.checked }, "Atalhos de Energia")
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
            <span>↩️ Desfazer alterações do Menu Iniciar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
