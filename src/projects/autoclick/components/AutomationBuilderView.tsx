import React, { useState } from "react";
import {
  Film,
  Plus,
  Trash2,
  Undo2,
  Redo2,
  MousePointer,
  Move,
  Clock,
  Repeat,
  Keyboard,
  MessageSquare,
  Search,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useAutoClickStore } from "../store/autoclickStore";
import { ActionType, AutomationAction, MouseButton, ClickType } from "../types";

export const AutomationBuilderView: React.FC = () => {
  const {
    timelineActions,
    addAction,
    updateAction,
    removeAction,
    undoTimeline,
    redoTimeline,
    timelineHistoryIndex,
    timelineHistory,
  } = useAutoClickStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActionId, setSelectedActionId] = useState<string | null>(
    timelineActions[0]?.id || null
  );

  const selectedAction = timelineActions.find((a) => a.id === selectedActionId);

  const actionPalette: {
    type: ActionType;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    defaultParams: any;
  }[] = [
    {
      type: "mouse.click",
      label: "Clique do Mouse",
      description: "Dispara clique Esquerdo/Direito/Meio",
      icon: <MousePointer size={16} />,
      color: "text-pink-500 bg-pink-500/10",
      defaultParams: { button: "left", clickType: "single" },
    },
    {
      type: "mouse.move",
      label: "Mover Cursor",
      description: "Move o cursor para X, Y",
      icon: <Move size={16} />,
      color: "text-blue-500 bg-blue-500/10",
      defaultParams: { x: 500, y: 400, duration_ms: 50 },
    },
    {
      type: "keyboard.press",
      label: "Pressionar Tecla",
      description: "Pressiona e solta uma tecla",
      icon: <Keyboard size={16} />,
      color: "text-emerald-500 bg-emerald-500/10",
      defaultParams: { key: "E", delay_ms: 50 },
    },
    {
      type: "wait",
      label: "Aguardar (Pausa)",
      description: "Espera um tempo em ms",
      icon: <Clock size={16} />,
      color: "text-amber-500 bg-amber-500/10",
      defaultParams: { minWait: 200 },
    },
    {
      type: "loop.start",
      label: "Início de Loop",
      description: "Repete bloco N vezes",
      icon: <Repeat size={16} />,
      color: "text-purple-500 bg-purple-500/10",
      defaultParams: { iterations: 5 },
    },
    {
      type: "loop.end",
      label: "Fim de Loop",
      description: "Fecha o bloco de repetição",
      icon: <Repeat size={16} />,
      color: "text-purple-500 bg-purple-500/10",
      defaultParams: {},
    },
    {
      type: "comment",
      label: "Comentário / Nota",
      description: "Nota explicativa sem efeito",
      icon: <MessageSquare size={16} />,
      color: "text-neutral-400 bg-neutral-500/10",
      defaultParams: { comment: "Nova etapa de cliques" },
    },
  ];

  const filteredPalette = actionPalette.filter(
    (a) =>
      a.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header with Undo/Redo */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center text-2xl shadow-soft">
            <Film size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-theme-text">Editor de Sequências & Linha do Tempo</h2>
            <span className="text-xs text-theme-text-muted">
              Monte fluxos avançados com cliques, teclas, movimentos de mouse, esperas e loops
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={undoTimeline}
            disabled={timelineHistoryIndex <= 0}
            className="p-2 rounded-xl bg-theme-surface-card hover:bg-theme-border/60 text-theme-text border border-theme-border/40 disabled:opacity-30"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redoTimeline}
            disabled={timelineHistoryIndex >= timelineHistory.length - 1}
            className="p-2 rounded-xl bg-theme-surface-card hover:bg-theme-border/60 text-theme-text border border-theme-border/40 disabled:opacity-30"
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
        </div>
      </div>

      {/* 3-Column Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Action Palette (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-theme-text uppercase">Paleta de Ações</span>
            <span className="text-[10px] text-theme-text-muted">{actionPalette.length} tipos</span>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-theme-text-muted" />
            <input
              type="text"
              placeholder="Pesquisar ação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs text-theme-text focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredPalette.map((item) => (
              <div
                key={item.type}
                onClick={() => {
                  addAction({
                    type: item.type,
                    delayBefore: 0,
                    parameters: item.defaultParams,
                    enabled: true,
                  });
                }}
                className="p-3 rounded-2xl bg-theme-surface-card hover:border-pink-400 border border-theme-border/40 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${item.color}`}>{item.icon}</div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-theme-text group-hover:text-theme-primary transition-colors">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-theme-text-muted">{item.description}</span>
                  </div>
                </div>
                <Plus size={14} className="text-theme-text-muted group-hover:text-theme-primary" />
              </div>
            ))}
          </div>
        </div>

        {/* Middle Column: Timeline Sequence (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-theme-text uppercase">Linha do Tempo</span>
            <span className="text-[10px] font-mono text-pink-500 font-bold">
              {timelineActions.length} ações
            </span>
          </div>

          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
            {timelineActions.map((action, index) => {
              const isSelected = action.id === selectedActionId;
              const paletteItem = actionPalette.find((p) => p.type === action.type);

              return (
                <div
                  key={action.id}
                  onClick={() => setSelectedActionId(action.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-pink-500/10 border-pink-500 shadow-soft"
                      : "bg-theme-surface-card border-theme-border/40 hover:border-pink-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] text-theme-text-muted w-4">
                      #{index + 1}
                    </span>
                    <div className={`p-1.5 rounded-lg ${paletteItem?.color || "bg-neutral-500/10"}`}>
                      {paletteItem?.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-theme-text">
                        {paletteItem?.label || action.type}
                      </span>
                      <span className="text-[10px] font-mono text-theme-text-muted">
                        {action.type === "mouse.click" &&
                          `${action.parameters.button} ${action.parameters.clickType}`}
                        {action.type === "keyboard.press" && `Tecla: ${action.parameters.key}`}
                        {action.type === "wait" && `Espera: ${action.parameters.minWait}ms`}
                        {action.type === "loop.start" && `${action.parameters.iterations}x`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAction(action.id);
                    }}
                    className="p-1 rounded-lg text-theme-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Action Properties (3 cols) */}
        <div className="lg:col-span-3 p-5 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-4">
          <span className="text-xs font-black text-theme-text uppercase">Propriedades</span>

          {selectedAction ? (
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-theme-text-muted font-bold">Tipo da Ação</span>
                <span className="font-mono font-bold text-theme-text bg-theme-surface-card p-2 rounded-xl border border-theme-border/40">
                  {selectedAction.type}
                </span>
              </div>

              {selectedAction.type === "mouse.click" && (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-theme-text-muted font-bold">Botão</span>
                    <select
                      value={selectedAction.parameters.button || "left"}
                      onChange={(e) =>
                        updateAction(selectedAction.id, {
                          parameters: { ...selectedAction.parameters, button: e.target.value as MouseButton },
                        })
                      }
                      className="p-2 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs font-bold text-theme-text focus:outline-none"
                    >
                      <option value="left">Esquerdo</option>
                      <option value="right">Direito</option>
                      <option value="middle">Meio</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-theme-text-muted font-bold">Tipo de Clique</span>
                    <select
                      value={selectedAction.parameters.clickType || "single"}
                      onChange={(e) =>
                        updateAction(selectedAction.id, {
                          parameters: { ...selectedAction.parameters, clickType: e.target.value as ClickType },
                        })
                      }
                      className="p-2 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs font-bold text-theme-text focus:outline-none"
                    >
                      <option value="single">Único</option>
                      <option value="double">Duplo</option>
                      <option value="triple">Triplo</option>
                    </select>
                  </div>
                </>
              )}

              {selectedAction.type === "keyboard.press" && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-theme-text-muted font-bold">Tecla a Pressionar</span>
                  <input
                    type="text"
                    value={selectedAction.parameters.key || "E"}
                    onChange={(e) =>
                      updateAction(selectedAction.id, {
                        parameters: { ...selectedAction.parameters, key: e.target.value.toUpperCase() },
                      })
                    }
                    className="p-2 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs font-mono font-bold text-theme-text focus:outline-none"
                  />
                </div>
              )}

              {selectedAction.type === "wait" && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-theme-text-muted font-bold">Tempo de Espera (ms)</span>
                  <input
                    type="number"
                    min="1"
                    value={selectedAction.parameters.minWait || 200}
                    onChange={(e) =>
                      updateAction(selectedAction.id, {
                        parameters: { ...selectedAction.parameters, minWait: parseInt(e.target.value) || 100 },
                      })
                    }
                    className="p-2 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs font-mono font-bold text-theme-text focus:outline-none"
                  />
                </div>
              )}

              {selectedAction.type === "loop.start" && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-theme-text-muted font-bold">Número de Repetições</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={selectedAction.parameters.iterations || 5}
                    onChange={(e) =>
                      updateAction(selectedAction.id, {
                        parameters: { ...selectedAction.parameters, iterations: parseInt(e.target.value) || 1 },
                      })
                    }
                    className="p-2 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs font-mono font-bold text-theme-text focus:outline-none"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-theme-text-muted text-center py-8">
              Selecione uma ação na Linha do Tempo para editar suas propriedades
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
