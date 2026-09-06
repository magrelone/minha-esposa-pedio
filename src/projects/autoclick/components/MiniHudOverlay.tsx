import React from "react";
import { MousePointer, Zap, Square } from "lucide-react";
import { useAutoClickStore } from "../store/autoclickStore";

export const MiniHudOverlay: React.FC = () => {
  const { isRunning, realCps, cps, sessionClicks, stopAutoClick } = useAutoClickStore();

  if (!isRunning) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 text-white shadow-2xl flex items-center gap-3 animate-fade-in select-none">
      <div className="w-8 h-8 rounded-xl bg-pink-500 flex items-center justify-center animate-pulse flex-shrink-0">
        <MousePointer size={16} className="text-white" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 font-mono text-xs font-black text-pink-400">
          <Zap size={12} className="text-amber-400" />
          <span>{realCps > 0 ? `${realCps} CPS` : `${cps} CPS`}</span>
        </div>
        <span className="text-[10px] text-white/70 font-mono">
          {sessionClicks.toLocaleString()} cliques
        </span>
      </div>

      <button
        onClick={() => stopAutoClick()}
        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors ml-1"
        title="Parar Auto Click"
      >
        <Square size={13} className="fill-white" />
      </button>
    </div>
  );
};
