import React, { useState, useEffect } from "react";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { undoService } from "../services/undoService";
import { useWindowsStore } from "../store/windowsStore";
import { SystemChangeRecord } from "../types";
import { History, Undo2, ShieldAlert, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";

export const BackupCenterView: React.FC = () => {
  const [history, setHistory] = useState<SystemChangeRecord[]>([]);
  const { undoSpecificChange, restoreAllToDefaults, isApplying } = useWindowsStore();

  const refreshHistory = () => {
    setHistory(undoService.getHistory());
  };

  useEffect(() => {
    refreshHistory();
    const unsub = undoService.subscribe(refreshHistory);
    return unsub;
  }, []);

  const handleUndoSingle = async (id: string) => {
    await undoSpecificChange(id);
    refreshHistory();
  };

  return (
    <div className="space-y-6">
      <StudioSectionHeader
        title="Backup & Rollback Center (Histórico de Desfazer)"
        subtitle="Auditoria completa de cada modificação com botão de desfazer individual e restauração de emergência."
        icon="💾"
        category="backup"
        compatibility="SUPPORTED"
      />

      {/* Cartão de Recuperação de Emergência */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-transparent border border-rose-500/30 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-theme-text">Emergency Safe Recovery (Modo de Segurança)</h3>
            <p className="text-xs text-theme-text-muted mt-0.5">
              Restaura imediatamente papéis de parede, sons, cores, barra e Explorer para os padrões seguros de fábrica.
            </p>
          </div>
        </div>

        <button
          onClick={restoreAllToDefaults}
          disabled={isApplying}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 active:scale-95 shadow-soft transition-all disabled:opacity-50 flex-shrink-0"
        >
          <RotateCcw size={14} className={isApplying ? "animate-spin" : ""} />
          <span>{isApplying ? "Restaurando..." : "Restaurar Tudo ao Padrão"}</span>
        </button>
      </div>

      {/* Linha do Tempo de Alterações com Desfazer por Item */}
      <div className="bg-theme-surface border border-theme-border/60 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
            <History size={16} className="text-pink-500" />
            <span>Linha do Tempo de Alterações Recentes</span>
          </h3>
          <span className="text-xs text-theme-text-muted font-medium">
            {history.length} evento(s) registrado(s)
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-theme-text-muted bg-theme-surface-card rounded-xl border border-theme-border/50">
            Nenhuma modificação foi aplicada ainda. Suas ações aparecerão aqui com a opção de desfazer imediata! ✨
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record) => {
              const isReverted = record.status === "reverted";
              const timeFormatted = new Date(record.timestamp).toLocaleTimeString();

              return (
                <div
                  key={record.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                    isReverted
                      ? "bg-theme-surface-card/40 border-theme-border/30 opacity-60"
                      : "bg-theme-surface-card border-theme-border hover:border-pink-500/40 shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                        isReverted ? "bg-slate-500/20 text-slate-400" : "bg-pink-500/20 text-pink-500"
                      }`}
                    >
                      {isReverted ? <RotateCcw size={14} /> : <CheckCircle2 size={14} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-theme-text">{record.title}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                            isReverted
                              ? "bg-slate-500/15 text-slate-400"
                              : "bg-emerald-500/15 text-emerald-500"
                          }`}
                        >
                          {isReverted ? "Desfeita" : "Ativa"}
                        </span>
                      </div>
                      <div className="text-[11px] text-theme-text-muted mt-0.5">
                        {record.description} • {timeFormatted}
                      </div>
                    </div>
                  </div>

                  {!isReverted && record.canUndo && (
                    <button
                      onClick={() => handleUndoSingle(record.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-pink-500 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition-all active:scale-95 flex-shrink-0"
                      title="Reverter esta alteração específica"
                    >
                      <Undo2 size={13} />
                      <span>Desfazer</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
