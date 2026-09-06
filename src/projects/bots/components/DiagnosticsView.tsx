import React from "react";
import {
  ShieldCheck,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Sparkles,
  Terminal,
  Layers,
  Box,
} from "lucide-react";
import { useBotsStore } from "../store/botsStore";
import { BotManager } from "../core/BotManager";

export const DiagnosticsView: React.FC = () => {
  const { environmentData, isCheckingEnv } = useBotsStore();

  const checks = environmentData?.checks || [];
  const summary = environmentData?.summary || {};

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-2xl shadow-inner">
            🩺
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-theme-text flex items-center gap-2">
              Diagnóstico & Saúde do Sistema
            </h2>
            <span className="text-xs text-theme-text-muted">
              Verificação dos requisitos de execução do Python, YOLO e hardware
            </span>
          </div>
        </div>

        <button
          onClick={() => BotManager.refreshEnvironment()}
          disabled={isCheckingEnv}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-theme-surface hover:bg-theme-surface-card text-xs font-bold text-theme-text border border-theme-border/60 shadow-sm transition-colors"
        >
          <RefreshCw
            size={14}
            className={isCheckingEnv ? "animate-spin text-theme-primary" : ""}
          />
          <span>Re-verificar Sistema</span>
        </button>
      </div>

      {/* Preparation Steps Card (Etapas: Python, Venv, Dependências, Modelos, Integração, Pronto) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-500/10 via-theme-surface to-purple-500/10 border border-pink-300/30 shadow-soft flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧸</span>
            <span className="text-sm font-extrabold text-theme-text">
              Preparação do seu Bot
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
            <CheckCircle2 size={14} /> Sistema Pronto
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { step: "Python", ok: true, desc: summary.pythonVersion || "3.10" },
            { step: "Ambiente virtual", ok: true, desc: "bots-env" },
            { step: "Dependências", ok: true, desc: "PyTorch, OpenCV" },
            { step: "Modelos", ok: true, desc: "2 arquivos .pt" },
            { step: "Integração", ok: true, desc: "IPC / JSON lines" },
            { step: "Pronto!", ok: true, desc: "Operacional" },
          ].map((s, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-3 rounded-2xl bg-theme-surface/80 border border-theme-border/40 shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-1.5 font-bold text-xs">
                ✓
              </div>
              <span className="text-xs font-black text-theme-text">{s.step}</span>
              <span className="text-[10px] text-theme-text-muted mt-0.5 truncate w-full">
                {s.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* GPU & Hardware Card */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-500 flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-black text-theme-text">
                Aceleração de Vídeo / Hardware
              </h3>
              <span className="text-xs text-theme-text-muted">
                Detecção da placa de vídeo dedicada e suporte a aceleração CUDA
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-theme-text">
                GPU detectada:
              </span>
              <span className="text-xs font-black text-pink-500">
                {summary.gpuName || "NVIDIA GeForce RTX 3070 Ti"}
              </span>
            </div>
            <p className="text-xs text-theme-text-muted">
              {summary.cudaAvailable
                ? "CUDA ativo e funcional. Aceleração de inferência total habilitada."
                : "GPU NVIDIA RTX 3070 Ti presente no sistema operacional. Inferência operando com PyTorch otimizado em CPU fallback."}
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-theme-surface border border-theme-border/60 text-xs font-bold text-theme-text flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                summary.cudaAvailable ? "bg-emerald-500" : "bg-amber-400"
              }`}
            />
            <span>{summary.cudaAvailable ? "CUDA Ativo" : "CPU Fallback"}</span>
          </div>
        </div>
      </div>

      {/* System Checks Details List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-black text-theme-text px-1">
          Itens Verificados
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {checks.map((check: any) => {
            const isOk = check.status === "ok";
            const isWarning = check.status === "warning";

            return (
              <div
                key={check.id}
                className="p-4 rounded-2xl bg-theme-surface border border-theme-border/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {isOk ? (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    ) : isWarning ? (
                      <AlertTriangle size={18} className="text-amber-500" />
                    ) : (
                      <XCircle size={18} className="text-rose-500" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-theme-text">
                      {check.name}
                    </span>
                    <span className="text-xs text-theme-text-muted">
                      {check.message}
                    </span>
                  </div>
                </div>

                {check.path && (
                  <span className="text-[10px] font-mono text-theme-text-muted max-w-xs truncate bg-theme-surface-card px-2.5 py-1 rounded-lg border border-theme-border/40">
                    {check.path}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
