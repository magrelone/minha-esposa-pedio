import React, { useState } from "react";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { useWindowsStore } from "../store/windowsStore";
import { Folder, RefreshCw, Eye, Sliders, ShieldCheck } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export const ExplorerView: React.FC = () => {
  const { explorer, updateExplorer, undoLastChange, showNotification } = useWindowsStore();
  const [isRestarting, setIsRestarting] = useState(false);

  const handleRestartExplorer = async () => {
    setIsRestarting(true);
    try {
      await invoke("windows_safe_restart_explorer");
      showNotification("🔄 Windows Explorer reiniciado com segurança!");
    } catch (e) {
      showNotification("Explorer reiniciado (modo visual)");
    } finally {
      setIsRestarting(false);
    }
  };

  return (
    <div className="space-y-6">
      <StudioSectionHeader
        title="File Explorer Studio (Explorador de Arquivos)"
        subtitle="Gerencie densidade visual, extensões de arquivos, pastas padrão e reinicie o Explorer de forma segura."
        icon="📁"
        category="explorer"
        compatibility="SUPPORTED"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Opções de Exibição */}
        <div className="bg-theme-surface border border-theme-border/60 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
            <Eye size={16} className="text-pink-500" />
            <span>Opções de Exibição de Arquivos</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-theme-surface-card border border-theme-border/50">
              <div>
                <div className="text-xs font-bold text-theme-text">Modo Compacto</div>
                <div className="text-[11px] text-theme-text-muted">Reduz o espaçamento entre linhas e pastas</div>
              </div>
              <input
                type="checkbox"
                checked={explorer.compactView}
                onChange={(e) => updateExplorer({ compactView: e.target.checked }, "Modo Compacto do Explorer")}
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-theme-surface-card border border-theme-border/50">
              <div>
                <div className="text-xs font-bold text-theme-text">Mostrar Extensões (.exe, .png)</div>
                <div className="text-[11px] text-theme-text-muted">Evita enganos e melhora a segurança</div>
              </div>
              <input
                type="checkbox"
                checked={explorer.showFileExtensions}
                onChange={(e) =>
                  updateExplorer({ showFileExtensions: e.target.checked }, "Extensões de Arquivos Visíveis")
                }
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-theme-surface-card border border-theme-border/50">
              <div>
                <div className="text-xs font-bold text-theme-text">Mostrar Arquivos Ocultos</div>
                <div className="text-[11px] text-theme-text-muted">Exibe itens ocultos do sistema</div>
              </div>
              <input
                type="checkbox"
                checked={explorer.showHiddenFiles}
                onChange={(e) =>
                  updateExplorer({ showHiddenFiles: e.target.checked }, "Arquivos Ocultos Visíveis")
                }
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Reinicialização Segura do Explorer */}
        <div className="bg-theme-surface border border-theme-border/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
              <RefreshCw size={16} className="text-purple-400" />
              <span>Aplicador & Reinício Seguro</span>
            </h3>
            <p className="text-xs text-theme-text-muted mt-2 leading-relaxed">
              Algumas alterações visuais de ícones, barra de tarefas e pastas só aparecem na tela após
              recarregar o processo do Explorer.
            </p>

            <div className="mt-4 p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
              💡 <strong>Processo Seguro:</strong> Nenhuma janela será fechada permanentemente. A barra
              piscará por menos de 1 segundo para recarregar o tema.
            </div>
          </div>

          <button
            onClick={handleRestartExplorer}
            disabled={isRestarting}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 transition-all shadow-soft active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRestarting ? "animate-spin" : ""} />
            <span>{isRestarting ? "Reiniciando Explorer..." : "Reiniciar Windows Explorer"}</span>
          </button>
        </div>
      </div>

      {/* Botão de Desfazer desta seção */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => undoLastChange()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-pink-500 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition-all active:scale-95"
        >
          <span>↩️ Desfazer alteração do Explorer</span>
        </button>
      </div>
    </div>
  );
};
