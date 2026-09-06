import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { useWindowsStore } from "../store/windowsStore";
import { Compass, Sparkles, Sliders, ShieldCheck, Eye, Layers, Play, CheckCircle2 } from "lucide-react";
import { HybridStartMenuPreview } from "../components/HybridStartMenuPreview";

export const StartMenuView: React.FC = () => {
  const { startMenu, updateStartMenu, undoLastChange } = useWindowsStore();
  const [openedPopup, setOpenedPopup] = useState(false);

  const handleOpenFloatingMenu = async () => {
    try {
      await invoke("windows_toggle_hybrid_start_menu");
      setOpenedPopup(true);
      setTimeout(() => setOpenedPopup(false), 3000);
    } catch (e) {
      console.error("Falha ao abrir menu flutuante:", e);
    }
  };

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
              <span>Menu Iniciar Híbrido Flutuante Real (Win 7 + 11)</span>
            </h3>
            <p className="text-xs text-theme-text-muted mt-0.5">
              Dois cliques ou atalho para abrir seu novo menu suspenso com duas colunas!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenFloatingMenu}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 shadow-soft transition-all active:scale-95 flex items-center gap-2"
              title="Abre a janela flutuante real do Menu Híbrido acima da barra de tarefas"
            >
              <Play size={14} fill="currentColor" />
              <span>{openedPopup ? "✨ Menu Iniciar Aberto!" : "🚀 Testar / Abrir Menu Flutuante (Ctrl+Alt+Z)"}</span>
            </button>

            <button
              onClick={() =>
                updateStartMenu({ layout: "hybrid_win7_11" }, "Ativado Menu Híbrido Win 7 + 11")
              }
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                startMenu.layout === "hybrid_win7_11"
                  ? "bg-pink-500/20 text-pink-400 border border-pink-500/40"
                  : "bg-theme-surface-card border border-theme-border text-theme-text hover:border-pink-500/40"
              }`}
            >
              {startMenu.layout === "hybrid_win7_11" ? "✓ Estilo Ativo" : "Definir como Padrão"}
            </button>
          </div>
        </div>

        {/* Banner Explicativo de Segurança do Windows 11 */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent border border-pink-500/20 text-xs text-theme-text space-y-2">
          <div className="font-bold flex items-center gap-2 text-pink-400">
            <CheckCircle2 size={16} />
            <span>Por que o Menu Iniciar Híbrido abre como janela flutuante?</span>
          </div>
          <p className="text-[11px] text-theme-text-muted leading-relaxed">
            A Microsoft no Windows 11 <strong>bloqueia</strong> a alteração do executável original (o menu azul oficial). Para sua segurança e não quebrar seu sistema operacional com injeção de DLLs arriscadas, nosso app disponibiliza o <strong>Menu Iniciar Híbrido Flutuante Oficial</strong>:
          </p>
          <ul className="text-[11px] text-theme-text-muted list-disc list-inside space-y-1 pl-1">
            <li>Pressione <strong>Ctrl + Alt + Z</strong> em qualquer tela ou jogo para abrir instantaneamente.</li>
            <li>Ou clique com o botão direito no <strong>ícone do nosso app na bandeja</strong> (perto do relógio) e selecione <em>"🚀 Abrir Menu Iniciar Híbrido"</em>.</li>
            <li>Ao clicar fora dele, ele <strong>se recolhe automaticamente</strong>, exatamente como o menu do Windows!</li>
          </ul>
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

        {/* Opção Principal de Substituição do Botão Iniciar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-transparent border border-pink-500/30 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-theme-text flex items-center gap-2">
              <Sparkles size={14} className="text-pink-400" />
              <span>Substituir Tecla e Botão Iniciar pelo Menu Híbrido</span>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold border border-pink-500/30">
                Recomendado
              </span>
            </div>
            <div className="text-[11px] text-theme-text-muted mt-0.5">
              Ao clicar no botão Iniciar da barra de tarefas ou apertar a tecla Windows do teclado, abre este Menu Híbrido e suprime o original (não ficam os dois abertos).
            </div>
          </div>
          <input
            type="checkbox"
            checked={startMenu.replaceNativeStartButton ?? true}
            onChange={(e) =>
              updateStartMenu(
                { replaceNativeStartButton: e.target.checked },
                e.target.checked
                  ? "Substituição do Menu Iniciar Ativada"
                  : "Substituição do Menu Iniciar Desativada"
              )
            }
            className="w-5 h-5 accent-pink-500 rounded cursor-pointer flex-shrink-0"
          />
        </div>

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
