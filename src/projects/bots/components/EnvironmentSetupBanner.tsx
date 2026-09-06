import React from "react";
import { Wrench, CheckCircle2, AlertTriangle, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { useBotsStore } from "../store/botsStore";
import { BotManager } from "../core/BotManager";

export const EnvironmentSetupBanner: React.FC = () => {
  const { environmentData, isCheckingEnv, setupProgress } = useBotsStore();

  const isReady = environmentData?.summary?.allReady ?? false;
  const isInstalling = setupProgress?.isInstalling ?? false;

  // Se já estiver 100% pronto e não estiver instalando, mostra apenas badge discreto ou nada
  if (isReady && !setupProgress) {
    return null;
  }

  return (
    <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-pink-500/15 border border-amber-500/30 shadow-soft space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            {isInstalling ? <Loader2 size={20} className="animate-spin" /> : <Wrench size={20} />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-theme-text flex items-center gap-1.5">
              <span>Dependências de Visão & IA dos Bots</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                {isInstalling ? "Instalando..." : "Configuração Necessária"}
              </span>
            </h4>
            <p className="text-[11px] text-theme-text-muted mt-0.5 leading-relaxed">
              {isInstalling
                ? setupProgress?.message || "Instalando Python, PyTorch, OpenCV e bibliotecas..."
                : "Para os bots detectarem objetos na tela neste computador, é necessário preparar o ambiente de IA (1 clique automático)."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isInstalling && (
            <button
              onClick={() => BotManager.setupEnvironment()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-pink-600 hover:opacity-95 shadow-soft transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles size={14} />
              <span>Instalar Automaticamente (1 Clique)</span>
            </button>
          )}

          <button
            onClick={() => BotManager.refreshEnvironment()}
            disabled={isCheckingEnv || isInstalling}
            className="p-2 rounded-xl bg-theme-surface hover:bg-theme-surface-card border border-theme-border/60 text-theme-text-muted hover:text-theme-text transition-colors"
            title="Re-verificar ambiente"
          >
            <RefreshCw size={14} className={isCheckingEnv ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Barra de Progresso Durante a Instalação */}
      {isInstalling && setupProgress && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-theme-text">
            <span>{setupProgress.message}</span>
            <span className="text-pink-400">{setupProgress.percent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 transition-all duration-300"
              style={{ width: `${setupProgress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Mensagem de Conclusão */}
      {setupProgress && !isInstalling && setupProgress.step === "finished" && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <CheckCircle2 size={16} />
          <span>{setupProgress.message}</span>
        </div>
      )}
    </div>
  );
};
