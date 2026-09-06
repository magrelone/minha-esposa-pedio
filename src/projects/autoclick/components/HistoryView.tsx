import React from "react";
import {
  History,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MousePointer,
  BarChart3,
  ShieldAlert,
} from "lucide-react";
import { useAutoClickStore } from "../store/autoclickStore";

export const HistoryView: React.FC = () => {
  const { history, clearHistory, sessionClicks, totalLifetimeClicks } = useAutoClickStore();

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center text-2xl shadow-soft">
            <History size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-theme-text">Histórico Local & Estatísticas</h2>
            <span className="text-xs text-theme-text-muted">
              Acompanhe as execuções anteriores, duração, total de cliques e motivo de encerramento
            </span>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-theme-surface-card hover:bg-red-500/10 text-xs font-bold text-red-500 border border-theme-border/40 transition-colors"
          >
            <Trash2 size={13} />
            <span>Limpar Histórico</span>
          </button>
        )}
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col">
          <span className="text-[10px] text-theme-text-muted font-bold uppercase">Cliques na Sessão</span>
          <span className="text-xl font-black text-theme-text font-mono mt-1">
            {sessionClicks.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col">
          <span className="text-[10px] text-theme-text-muted font-bold uppercase">Total Histórico</span>
          <span className="text-xl font-black text-pink-500 font-mono mt-1">
            {totalLifetimeClicks.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col">
          <span className="text-[10px] text-theme-text-muted font-bold uppercase">Execuções Registradas</span>
          <span className="text-xl font-black text-theme-text font-mono mt-1">
            {history.length}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col">
          <span className="text-[10px] text-theme-text-muted font-bold uppercase">Privacidade</span>
          <span className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-1">
            <CheckCircle2 size={13} /> 100% Local
          </span>
        </div>
      </div>

      {/* Runs Table */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-4">
        <span className="text-xs font-black text-theme-text uppercase">Últimas Execuções</span>

        {history.length === 0 ? (
          <div className="text-xs text-theme-text-muted text-center py-10">
            Nenhuma execução recente registrada no histórico
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {history.map((h) => {
              const isPanic = h.status === "panic_stopped";
              return (
                <div
                  key={h.id}
                  className="p-3.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        isPanic ? "bg-red-500/15 text-red-500" : "bg-emerald-500/15 text-emerald-500"
                      }`}
                    >
                      {isPanic ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
                    </div>

                    <div className="flex flex-col">
                      <span className="font-bold text-theme-text">{h.profileName}</span>
                      <span className="text-[10px] text-theme-text-muted">
                        Início: {h.startedAt} • Fim: {h.finishedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-theme-text">{h.clickCount.toLocaleString()} cliques</span>
                      <span className="text-[10px] text-theme-text-muted">{h.durationSeconds}s de duração</span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isPanic
                          ? "bg-red-500/15 text-red-600 dark:text-red-400"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {h.stopReason}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
