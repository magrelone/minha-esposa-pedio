import React from "react";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { useWindowsStore } from "../store/windowsStore";
import { Compass, Sparkles, Sliders, ShieldCheck, Eye, Layers } from "lucide-react";
import { HybridStartMenuPreview } from "../components/HybridStartMenuPreview";

export const StartMenuView: React.FC = () => {
  const { startMenu, updateStartMenu, undoLastChange } = useWindowsStore();

  const layouts = [
    {
      id: "hybrid_win7_11",
      name: "Fusão Windows 7 + 11 ✨",
      desc: "O melhor dos dois mundos: 2 colunas ergonômicas do Win 7 com o design Fluent do Win 11",
      badge: "Mais Pedido",
      isHighlight: true,
    },
    {
      id: "windows11",
      name: "Windows 11 Fluent",
      desc: "Grade moderna com campo de pesquisa centralizado no topo",
      badge: "Padrão Oficial",
    },
    {
      id: "windows10",
      name: "Windows 10 Híbrido",
      desc: "Lista vertical clássica à esquerda com blocos",
      badge: "Produtividade",
    },
    {
      id: "windows7",
      name: "Windows 7 Puro Clássico",
      desc: "Duas colunas clássicas de programas e painel de controle",
      badge: "Nostálgico",
    },
    {
      id: "minimal",
      name: "Minimalista Clean",
      desc: "Apenas aplicativos favoritos e barra de busca limpa",
      badge: "Compacto",
    },
  ];

  return (
    <div className="space-y-6">
      <StudioSectionHeader
        title="Start Menu Studio (Menu Iniciar Híbrido & Clássico)"
        subtitle="Alterne entre o layout moderno do Windows 11 e a consagrada fusão em duas colunas do Windows 7."
        icon="🚀"
        category="start_menu"
        compatibility="SUPPORTED"
      />

      {/* Grade de Seleção de Layouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {layouts.map((layout) => {
          const isSelected = startMenu.layout === layout.id;
          return (
            <div
              key={layout.id}
              onClick={() =>
                updateStartMenu({ layout: layout.id as any }, `Layout Start: ${layout.name}`)
              }
              className={`relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "bg-theme-primary/10 border-theme-primary shadow-soft scale-[1.01]"
                  : "bg-theme-surface border-theme-border/60 hover:border-theme-primary/40"
              } ${layout.isHighlight ? "ring-1 ring-pink-500/40" : ""}`}
            >
              {layout.badge && (
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      layout.isHighlight
                        ? "bg-pink-500 text-white shadow-xs"
                        : "bg-theme-surface-card border border-theme-border text-theme-text-muted"
                    }`}
                  >
                    {layout.badge}
                  </span>
                </div>
              )}

              <div className="pr-16 mb-2">
                <span className="text-xs font-bold text-theme-text flex items-center gap-1.5">
                  {layout.name}
                </span>
              </div>
              <p className="text-[11px] text-theme-text-muted leading-relaxed">{layout.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Demonstração Interativa do Menu Iniciar Híbrido (Fusão Win7 + Win11) */}
      <div className="bg-theme-surface border border-theme-border/60 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme-border/40">
          <div>
            <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
              <Sparkles size={16} className="text-pink-500" />
              <span>Pré-visualização Interativa do Menu Iniciar Híbrido (Win 7 + 11)</span>
            </h3>
            <p className="text-xs text-theme-text-muted mt-0.5">
              Experimente a ergonomia de duas colunas: busque apps na esquerda e acesse Documentos, Imagens e Meu Computador na direita!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                updateStartMenu({ layout: "hybrid_win7_11" }, "Ativado Menu Híbrido Win 7 + 11")
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                startMenu.layout === "hybrid_win7_11"
                  ? "bg-pink-500 text-white shadow-soft"
                  : "bg-theme-surface-card border border-theme-border text-theme-text hover:border-pink-500/40"
              }`}
            >
              {startMenu.layout === "hybrid_win7_11" ? "Estilo Selecionado ✨" : "Escolher este Estilo"}
            </button>
          </div>
        </div>

        {/* Componente do Menu Híbrido */}
        <div className="py-2">
          <HybridStartMenuPreview />
        </div>
      </div>

      {/* Opções de Privacidade e Exibição */}
      <div className="bg-theme-surface border border-theme-border/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
          <Sliders size={16} className="text-pink-500" />
          <span>Preferências de Exibição e Privacidade</span>
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
