import React from "react";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { useWindowsStore } from "../store/windowsStore";
import { Layout, Clock, Eye, Sliders, ShieldCheck } from "lucide-react";

export const TaskbarView: React.FC = () => {
  const { taskbar, updateTaskbar, undoLastChange } = useWindowsStore();

  return (
    <div className="space-y-6">
      <StudioSectionHeader
        title="Taskbar Studio (Barra de Tarefas)"
        subtitle="Alinhe ícones, configure transparência, mostre segundos no relógio com desfazer instantâneo."
        icon="📌"
        category="taskbar"
        compatibility="SUPPORTED"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Alinhamento */}
        <div className="bg-theme-surface border border-theme-border/60 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
            <Layout size={16} className="text-pink-500" />
            <span>Alinhamento dos Ícones</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateTaskbar({ alignment: "center" }, "Barra: Ícones Centralizados")}
              className={`p-3.5 rounded-xl border text-xs font-bold transition-all ${
                taskbar.alignment === "center"
                  ? "bg-theme-primary text-white border-transparent shadow-soft"
                  : "bg-theme-surface-card border-theme-border text-theme-text hover:border-theme-primary/50"
              }`}
            >
              Centralizado (Win 11)
            </button>

            <button
              onClick={() => updateTaskbar({ alignment: "left" }, "Barra: Ícones à Esquerda")}
              className={`p-3.5 rounded-xl border text-xs font-bold transition-all ${
                taskbar.alignment === "left"
                  ? "bg-theme-primary text-white border-transparent shadow-soft"
                  : "bg-theme-surface-card border-theme-border text-theme-text hover:border-theme-primary/50"
              }`}
            >
              À Esquerda (Clássico)
            </button>
          </div>
        </div>

        {/* Transparência */}
        <div className="bg-theme-surface border border-theme-border/60 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
            <Sliders size={16} className="text-purple-400" />
            <span>Estilo de Transparência</span>
          </h3>

          <div className="grid grid-cols-3 gap-2.5">
            {(["default", "blur", "acrylic"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => updateTaskbar({ transparencyMode: mode }, `Transparência: ${mode}`)}
                className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                  taskbar.transparencyMode === mode
                    ? "bg-theme-primary text-white border-transparent shadow-soft"
                    : "bg-theme-surface-card border-theme-border text-theme-text hover:border-theme-primary/50"
                }`}
              >
                {mode === "default" ? "Padrão" : mode === "blur" ? "Desfoque" : "Acrílico"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Relógio e Opções Adicionais */}
      <div className="bg-theme-surface border border-theme-border/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
          <Clock size={16} className="text-amber-400" />
          <span>Relógio e Ícones de Sistema</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-theme-surface-card border border-theme-border/50">
            <div>
              <div className="text-xs font-bold text-theme-text">Mostrar Segundos</div>
              <div className="text-[11px] text-theme-text-muted">Exibe os segundos no relógio da bandeja</div>
            </div>
            <input
              type="checkbox"
              checked={taskbar.showSecondsInClock}
              onChange={(e) =>
                updateTaskbar({ showSecondsInClock: e.target.checked }, "Segundos no Relógio")
              }
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-theme-surface-card border border-theme-border/50">
            <div>
              <div className="text-xs font-bold text-theme-text">Ícones Compactos</div>
              <div className="text-[11px] text-theme-text-muted">Reduz o tamanho dos botões na barra</div>
            </div>
            <input
              type="checkbox"
              checked={taskbar.compactIcons}
              onChange={(e) => updateTaskbar({ compactIcons: e.target.checked }, "Ícones Compactos")}
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-theme-surface-card border border-theme-border/50">
            <div>
              <div className="text-xs font-bold text-theme-text">Barra de Pesquisa</div>
              <div className="text-[11px] text-theme-text-muted">Exibe a caixa de pesquisa do Windows</div>
            </div>
            <input
              type="checkbox"
              checked={taskbar.showSearch}
              onChange={(e) => updateTaskbar({ showSearch: e.target.checked }, "Pesquisa na Barra")}
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
            <span>↩️ Desfazer alteração da barra de tarefas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
