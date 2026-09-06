import React from "react";
import {
  Play,
  Pause,
  Square,
  Settings,
  FileText,
  Heart,
  Sparkles,
  Bot,
  Layers,
} from "lucide-react";
import { useBotsStore } from "../store/botsStore";
import { BOT_REGISTRY } from "../core/BotRegistry";
import { BotManager } from "../core/BotManager";

export const MyBotsView: React.FC = () => {
  const {
    botStatus,
    botConfigs,
    favorites,
    toggleFavorite,
    setConfigModalBotId,
    setActiveTab,
  } = useBotsStore();

  const installedBots = BOT_REGISTRY.filter((b) => b.installed);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-5 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center text-2xl shadow-inner">
            🎮
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-theme-text">Meus Bots</h2>
            <span className="text-xs text-theme-text-muted">
              Automações prontas para executar no seu computador
            </span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("library")}
          className="text-xs font-bold text-theme-primary hover:underline"
        >
          Explorar catálogo de bots →
        </button>
      </div>

      {/* Installed Bots List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {installedBots.map((bot) => {
          const status = botStatus[bot.id] || "stopped";
          const config = botConfigs[bot.id] || bot.defaultConfig;
          const isRunning = status === "running";
          const isFav = favorites.includes(bot.id);

          return (
            <div
              key={bot.id}
              className="p-5 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft hover:shadow-card transition-all flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/15 flex items-center justify-center text-2xl shadow-inner">
                    {bot.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-theme-text">
                      {bot.name}
                    </span>
                    <span className="text-xs text-pink-500 font-semibold">
                      {bot.game}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleFavorite(bot.id)}
                  className="p-2 rounded-xl text-pink-500 hover:bg-theme-surface-card transition-colors"
                >
                  <Heart
                    size={16}
                    className={isFav ? "fill-pink-500" : "opacity-40"}
                  />
                </button>
              </div>

              <p className="text-xs text-theme-text-muted line-clamp-2">
                {bot.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-theme-border/40">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isRunning ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                    }`}
                  />
                  <span className="text-xs font-bold text-theme-text capitalize">
                    {status === "stopped" ? "Parado" : status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfigModalBotId(bot.id)}
                    className="px-3 py-1.5 rounded-xl bg-theme-surface-card text-xs font-bold text-theme-text border border-theme-border/60 hover:bg-theme-border"
                  >
                    Configurar
                  </button>

                  {status === "initializing" ? (
                    <button
                      disabled
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/80 text-xs font-bold text-white shadow-soft flex items-center gap-1 cursor-wait animate-pulse"
                    >
                      <Sparkles size={12} className="animate-spin" /> Carregando...
                    </button>
                  ) : isRunning ? (
                    <button
                      onClick={() => BotManager.stopBot(bot.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white shadow-soft flex items-center gap-1"
                    >
                      <Square size={12} /> Parar
                    </button>
                  ) : (
                    <button
                      onClick={() => BotManager.startBot(bot.id, config)}
                      className="px-3.5 py-1.5 rounded-xl bg-theme-primary hover:bg-theme-primary/90 text-xs font-bold text-white shadow-soft flex items-center gap-1"
                    >
                      <Play size={12} className="fill-white" /> Iniciar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
