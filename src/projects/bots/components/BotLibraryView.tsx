import React from "react";
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Shield,
  Zap,
} from "lucide-react";
import { BOT_REGISTRY } from "../core/BotRegistry";
import { useBotsStore } from "../store/botsStore";

export const BotLibraryView: React.FC = () => {
  const { setActiveTab, setRobloxSubTab } = useBotsStore();

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-5 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/15 text-pink-500 flex items-center justify-center text-2xl shadow-inner">
            📚
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-theme-text">
              Biblioteca de Bots & Automações
            </h2>
            <span className="text-xs text-theme-text-muted">
              Catálogo geral preparado para receber novos providers e automações futuras
            </span>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BOT_REGISTRY.map((bot) => (
          <div
            key={bot.id}
            className="p-5 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft hover:shadow-card transition-all flex flex-col justify-between gap-4"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500/15 to-rose-500/20 flex items-center justify-center text-3xl shadow-inner">
                  {bot.icon}
                </div>
                {bot.installed ? (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Instalado
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500 flex items-center gap-1">
                    <Clock size={11} /> Em breve
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-black text-theme-text">{bot.name}</h3>
                <span className="text-xs text-theme-text-muted font-medium">
                  {bot.game} • {bot.category}
                </span>
              </div>

              <p className="text-xs text-theme-text-muted line-clamp-3 leading-relaxed">
                {bot.description}
              </p>
            </div>

            <div className="pt-3 border-t border-theme-border/40 flex items-center justify-between">
              <span className="text-[11px] font-mono text-theme-text-muted">
                v{bot.version}
              </span>

              {bot.installed ? (
                <button
                  onClick={() => {
                    setActiveTab("roblox");
                    setRobloxSubTab("library");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-theme-primary hover:bg-theme-primary/90 text-xs font-bold text-white shadow-soft flex items-center gap-1"
                >
                  <span>Abrir Bot</span>
                  <ArrowUpRight size={13} />
                </button>
              ) : (
                <button
                  disabled
                  className="px-3 py-1.5 rounded-xl bg-theme-surface-card text-xs font-semibold text-theme-text-muted cursor-not-allowed border border-theme-border/60"
                >
                  Em desenvolvimento
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
