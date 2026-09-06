import React from "react";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { useWindowsStore } from "../store/windowsStore";
import { LayoutGrid, Check, Eye, EyeOff, Pin } from "lucide-react";

export const WidgetsStudioView: React.FC = () => {
  const { widgets, toggleWidget, undoLastChange } = useWindowsStore();

  return (
    <div className="space-y-6">
      <StudioSectionHeader
        title="Desktop Widgets (Gadgets de Área de Trabalho)"
        subtitle="Widgets leves inspirados em Rainmeter com isolamento seguro e controle visual."
        icon="🧩"
        category="widgets"
        compatibility="EXPERIMENTAL"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className="flex flex-col justify-between p-4.5 rounded-2xl bg-theme-surface border border-theme-border/60 hover:border-pink-500/40 transition-all shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-theme-text">{widget.title}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    widget.enabled
                      ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                      : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                  }`}
                >
                  {widget.enabled ? "VISÍVEL" : "OCULTO"}
                </span>
              </div>

              <p className="text-[11px] text-theme-text-muted">
                Estilo: <strong className="capitalize text-theme-text">{widget.style}</strong> •
                Posição: ({widget.position.x}, {widget.position.y})
              </p>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-theme-border/40">
              <button
                onClick={() => toggleWidget(widget.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  widget.enabled
                    ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25"
                    : "bg-pink-500 text-white shadow-soft hover:opacity-95"
                }`}
              >
                {widget.enabled ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{widget.enabled ? "Ocultar do Desktop" : "Mostrar no Desktop"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Botão de Desfazer desta seção */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => undoLastChange()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-pink-500 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition-all active:scale-95"
        >
          <span>↩️ Desfazer última alteração de widgets</span>
        </button>
      </div>
    </div>
  );
};
