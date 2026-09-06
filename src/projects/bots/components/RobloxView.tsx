import React from "react";
import {
  Play,
  Pause,
  Square,
  Settings,
  FileText,
  Heart,
  Sparkles,
  Shield,
  Layers,
  Cpu,
  BookOpen,
  CheckCircle2,
  Activity,
  Box,
  SlidersHorizontal,
} from "lucide-react";
import { useBotsStore } from "../store/botsStore";
import { BOT_REGISTRY } from "../core/BotRegistry";
import { BotManager } from "../core/BotManager";
import { RobloxSubTab } from "../types";

export const RobloxView: React.FC = () => {
  const {
    robloxSubTab,
    setRobloxSubTab,
    botStatus,
    botConfigs,
    favorites,
    toggleFavorite,
    setConfigModalBotId,
    setActiveTab,
    profiles,
    applyProfile,
    activeProfileId,
    discoveredModels,
  } = useBotsStore();

  const robloxBots = BOT_REGISTRY.filter((b) => b.game.toLowerCase().includes("roblox"));

  // Filter bots based on subtab
  const displayedBots = robloxBots.filter((b) => {
    const status = botStatus[b.id] || "stopped";
    if (robloxSubTab === "active") {
      return status !== "stopped";
    }
    if (robloxSubTab === "installed") {
      return b.installed;
    }
    return true; // "library" shows all
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Subtabs Bar */}
      <div className="flex items-center justify-between border-b border-theme-border/60 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "library", label: "Biblioteca", icon: <BookOpen size={14} /> },
            { id: "installed", label: "Instalados", icon: <CheckCircle2 size={14} /> },
            { id: "active", label: "Ativos", icon: <Activity size={14} /> },
            { id: "models", label: "Modelos YOLO", icon: <Box size={14} /> },
            { id: "profiles", label: "Perfis de Jogo", icon: <SlidersHorizontal size={14} /> },
          ].map((tab) => {
            const isActive = robloxSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRobloxSubTab(tab.id as RobloxSubTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-theme-primary text-white shadow-soft"
                    : "bg-theme-surface hover:bg-theme-surface-card text-theme-text-muted hover:text-theme-text border border-theme-border/40"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setActiveTab("diagnostics")}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-bold hover:bg-pink-500/20 transition-colors"
        >
          <Sparkles size={13} />
          <span>Verificação de Hardware</span>
        </button>
      </div>

      {/* Models Subtab Content */}
      {robloxSubTab === "models" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {discoveredModels.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-theme-primary px-2.5 py-0.5 rounded-lg bg-theme-primary/10 border border-theme-primary/20">
                    {m.filename}
                  </span>
                  <p className="text-xs text-theme-text-muted mt-2">{m.notes}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-500">
                  {m.sizeFormatted}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {m.classes.map((cls, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-theme-surface-card text-theme-text-muted border border-theme-border/60"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profiles Subtab Content */}
      {robloxSubTab === "profiles" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profiles.map((p) => {
            const isActive = activeProfileId === p.id;
            return (
              <div
                key={p.id}
                className={`p-5 rounded-3xl bg-theme-surface border transition-all flex flex-col justify-between gap-4 ${
                  isActive
                    ? "border-pink-500 shadow-soft ring-2 ring-pink-400/20"
                    : "border-theme-border/60 hover:border-pink-300/40 shadow-soft"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-theme-text">
                      {p.name}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-500 text-white">
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-theme-text-muted leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-theme-border/40">
                  <span className="text-[11px] font-mono text-theme-text-muted">
                    Modo: {p.config.mode || "coin_only"}
                  </span>
                  <button
                    onClick={() => applyProfile(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-theme-surface-card text-theme-text-muted cursor-default"
                        : "bg-theme-primary text-white shadow-soft hover:bg-theme-primary/90"
                    }`}
                  >
                    {isActive ? "Em uso" : "Usar Perfil"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bots Cards List (Library / Installed / Active) */}
      {["library", "installed", "active"].includes(robloxSubTab) && (
        <div className="grid grid-cols-1 gap-6">
          {displayedBots.map((bot) => {
            const status = botStatus[bot.id] || "stopped";
            const config = botConfigs[bot.id] || bot.defaultConfig;
            const isFav = favorites.includes(bot.id);
            const isRunning = status === "running";
            const isPaused = status === "paused";
            const isInit = status === "initializing";

            // Status Badge Colors & Labels
            const statusConfig = {
              stopped: { color: "bg-gray-400", text: "Parado", textColor: "text-gray-500" },
              initializing: {
                color: "bg-amber-400 animate-pulse",
                text: "Inicializando",
                textColor: "text-amber-500",
              },
              running: {
                color: "bg-emerald-500 animate-pulse",
                text: "Rodando",
                textColor: "text-emerald-500",
              },
              paused: { color: "bg-blue-400", text: "Pausado", textColor: "text-blue-500" },
              error: { color: "bg-rose-500", text: "Erro", textColor: "text-rose-500" },
            }[status] || { color: "bg-gray-400", text: "Parado", textColor: "text-gray-500" };

            const selectedModelName = config.weights.split("/").pop() || "yolo_coin_m_v3.pt";

            return (
              <div
                key={bot.id}
                className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 hover:border-pink-300/60 shadow-soft hover:shadow-card transition-all flex flex-col gap-6"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-400/20 to-rose-500/20 border border-pink-300/30 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
                      {bot.icon}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-theme-text">
                          {bot.name}
                        </h2>
                        <button
                          onClick={() => toggleFavorite(bot.id)}
                          className="p-1.5 rounded-lg hover:bg-theme-surface-card text-pink-500 transition-colors"
                          title="Favoritar bot"
                        >
                          <Heart
                            size={18}
                            className={isFav ? "fill-pink-500" : "opacity-40"}
                          />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-pink-500">{bot.game}</span>
                        <span className="text-theme-border">•</span>
                        <span className="text-theme-text-muted">{bot.category}</span>
                        <span className="text-theme-border">•</span>
                        <span className="text-[11px] font-mono text-theme-text-muted">
                          v{bot.version}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator Pill */}
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-theme-surface-card border border-theme-border/60">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.color}`} />
                    <span className={`text-xs font-black ${statusConfig.textColor}`}>
                      ● {statusConfig.text}
                    </span>
                  </div>
                </div>

                {/* Description & Specs */}
                <p className="text-xs text-theme-text-muted leading-relaxed">
                  {bot.description}
                </p>

                {/* Metadata & Capabilities Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-theme-surface-card/60 border border-theme-border/40 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-theme-text-muted uppercase font-bold">
                      Origem / Autor
                    </span>
                    <span className="font-semibold text-theme-text truncate">
                      {bot.provider}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-theme-text-muted uppercase font-bold">
                      Modelo em Uso
                    </span>
                    <span className="font-semibold text-pink-500 truncate font-mono text-[11px]">
                      {selectedModelName}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-theme-text-muted uppercase font-bold">
                      Modo Atual
                    </span>
                    <span className="font-semibold text-theme-text capitalize">
                      {config.mode === "coin_and_players"
                        ? "Moedas + Jogadores"
                        : "Apenas Moedas"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-theme-text-muted uppercase font-bold">
                      Simulação
                    </span>
                    <span
                      className={`font-semibold ${
                        config.simulation_mode ? "text-amber-500" : "text-emerald-500"
                      }`}
                    >
                      {config.simulation_mode ? "Simulação Segura" : "Teclas Reais"}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-theme-border/40">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfigModalBotId(bot.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-theme-surface hover:bg-theme-surface-card text-xs font-bold text-theme-text border border-theme-border/60 shadow-sm transition-colors"
                    >
                      <Settings size={14} />
                      <span>Configurar</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("logs")}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-theme-surface hover:bg-theme-surface-card text-xs font-bold text-theme-text border border-theme-border/60 shadow-sm transition-colors"
                    >
                      <FileText size={14} />
                      <span>Abrir Logs</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("vision")}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-theme-surface hover:bg-theme-surface-card text-xs font-bold text-theme-text border border-theme-border/60 shadow-sm transition-colors"
                    >
                      <span>👁 Ver Visão</span>
                    </button>
                  </div>

                  {/* Execution Controls */}
                  <div className="flex items-center gap-2">
                    {isRunning && (
                      <button
                        onClick={() => BotManager.pauseBot(bot.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white shadow-soft transition-transform active:scale-95"
                      >
                        <Pause size={14} />
                        <span>Pausar</span>
                      </button>
                    )}

                    {isPaused && (
                      <button
                        onClick={() => BotManager.resumeBot(bot.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white shadow-soft transition-transform active:scale-95"
                      >
                        <Play size={14} className="fill-white" />
                        <span>Retomar</span>
                      </button>
                    )}

                    {isInit && (
                      <button
                        disabled
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-amber-500/80 text-xs font-bold text-white shadow-soft cursor-wait animate-pulse"
                      >
                        <Sparkles size={14} className="animate-spin" />
                        <span>Carregando YOLO... 🧸</span>
                      </button>
                    )}

                    {(isRunning || isPaused) && (
                      <button
                        onClick={() => BotManager.stopBot(bot.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white shadow-soft transition-transform active:scale-95"
                      >
                        <Square size={14} />
                        <span>Parar</span>
                      </button>
                    )}

                    {!isRunning && !isPaused && !isInit && (
                      <button
                        onClick={() => BotManager.startBot(bot.id, config)}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-xs font-black text-white shadow-soft hover:shadow-glow transition-all active:scale-95"
                      >
                        <Play size={14} className="fill-white" />
                        <span>Iniciar Bot 🧸</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
