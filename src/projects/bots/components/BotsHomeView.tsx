import React from "react";
import {
  Sparkles,
  Bot,
  Eye,
  Settings,
  Heart,
  Play,
  Square,
  Activity,
  Cpu,
  ShieldCheck,
  ChevronRight,
  Radar,
  Gamepad2,
  Compass,
  MapPin,
} from "lucide-react";
import { useBotsStore } from "../store/botsStore";
import { BOT_REGISTRY } from "../core/BotRegistry";
import { BotManager } from "../core/BotManager";

export const BotsHomeView: React.FC = () => {
  const {
    setActiveTab,
    favorites,
    botStatus,
    toggleFavorite,
    hardwareDevice,
    fpsCapture,
    fpsInference,
    setConfigModalBotId,
  } = useBotsStore();

  const favoriteBots = BOT_REGISTRY.filter((b) => favorites.includes(b.id));
  const activeBots = BOT_REGISTRY.filter(
    (b) => botStatus[b.id] && botStatus[b.id] !== "stopped"
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Cute Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500/15 via-rose-400/10 to-purple-500/15 border border-pink-300/30 p-6 shadow-soft">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-300 text-xs font-bold w-fit">
              <Sparkles size={14} className="animate-spin-slow" />
              <span>Automações & Inteligência</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-theme-text flex items-center gap-2">
              Central de Bots
            </h1>
            <p className="text-sm font-medium text-pink-600 dark:text-pink-300 flex items-center gap-1.5">
              “Mais uma coisinha que você pediu 💕”
            </p>
          </div>

          <div className="flex items-center gap-3 bg-theme-surface/80 backdrop-blur-md p-3 rounded-2xl border border-theme-border/40 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950/50 flex items-center justify-center text-pink-500">
              <Cpu size={20} />
            </div>
            <div className="flex flex-col text-xs">
              <span className="text-theme-text-muted">Aceleração Ativa</span>
              <span className="font-bold text-theme-text truncate max-w-[180px]">
                {hardwareDevice || "NVIDIA RTX 3070 Ti"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Big Category Cards with Clean Single Vector Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Roblox */}
        <div
          onClick={() => setActiveTab("roblox")}
          className="group relative cursor-pointer p-5 rounded-3xl bg-theme-surface border border-theme-border/60 hover:border-pink-400/60 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Gamepad2 size={24} />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-theme-surface-card text-theme-text-muted group-hover:text-theme-primary transition-colors">
              Explorar
            </span>
          </div>
          <div>
            <h3 className="text-lg font-black text-theme-text mb-1 flex items-center gap-1">
              Roblox
              <ChevronRight
                size={16}
                className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-theme-primary"
              />
            </h3>
            <p className="text-xs text-theme-text-muted">
              MM2 Coin Collector e automações exclusivas para Roblox.
            </p>
          </div>
        </div>

        {/* Meus Bots */}
        <div
          onClick={() => setActiveTab("my-bots")}
          className="group relative cursor-pointer p-5 rounded-3xl bg-theme-surface border border-theme-border/60 hover:border-purple-400/60 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Bot size={24} />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-theme-surface-card text-theme-text-muted group-hover:text-purple-500 transition-colors">
              {activeBots.length > 0 ? `${activeBots.length} Ativo(s)` : "Gerenciar"}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-black text-theme-text mb-1 flex items-center gap-1">
              Meus Bots
              <ChevronRight
                size={16}
                className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-purple-500"
              />
            </h3>
            <p className="text-xs text-theme-text-muted">
              Controle rápido de processos, status, pausas e execuções.
            </p>
          </div>
        </div>

        {/* Visão do Bot */}
        <div
          onClick={() => setActiveTab("vision")}
          className="group relative cursor-pointer p-5 rounded-3xl bg-theme-surface border border-theme-border/60 hover:border-blue-400/60 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Eye size={24} />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-theme-surface-card text-theme-text-muted group-hover:text-blue-500 transition-colors">
              Live Preview
            </span>
          </div>
          <div>
            <h3 className="text-lg font-black text-theme-text mb-1 flex items-center gap-1">
              Visão do Bot
              <ChevronRight
                size={16}
                className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-blue-500"
              />
            </h3>
            <p className="text-xs text-theme-text-muted">
              Overlay de detecções, bounding boxes e FPS em tempo real.
            </p>
          </div>
        </div>

        {/* Configurações & Diagnóstico */}
        <div
          onClick={() => setActiveTab("diagnostics")}
          className="group relative cursor-pointer p-5 rounded-3xl bg-theme-surface border border-theme-border/60 hover:border-emerald-400/60 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-theme-surface-card text-theme-text-muted group-hover:text-emerald-500 transition-colors">
              Saúde do Sistema
            </span>
          </div>
          <div>
            <h3 className="text-lg font-black text-theme-text mb-1 flex items-center gap-1">
              Diagnóstico
              <ChevronRight
                size={16}
                className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-emerald-500"
              />
            </h3>
            <p className="text-xs text-theme-text-muted">
              Status do Python, venv isolado, GPU RTX 3070 Ti e modelos YOLO.
            </p>
          </div>
        </div>
      </div>

      {/* Holographic 2D Map Live Preview Banner on Menu */}
      <div className="relative overflow-hidden rounded-3xl bg-[#030712] border-2 border-cyan-500/30 p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 group">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ffff08_1px,transparent_1px),linear-gradient(to_bottom,#00ffff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex-shrink-0">
            <Radar size={28} className="animate-spin" style={{ animationDuration: "6s" }} />
            <span className="absolute w-2 h-2 rounded-full bg-emerald-400 top-2 right-2 animate-ping" />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                CARTOGRAFIA 2D HOLOGRÁFICA
              </span>
              <span className="text-[11px] text-gray-400 font-mono">
                Satélite Online • 320m x 320m
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white">
              Preview do Mapa: Distrito de Hanami (Circuito Sagrado)
            </h3>
            <p className="text-xs text-gray-400 max-w-lg">
              6 waypoints salvos com traçado de laser, zonas de spawn de Ursos Brancos/Pretos e radar tático.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => setActiveTab("mapping")}
            className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 transition-transform active:scale-95"
          >
            <Radar size={15} />
            <span>Abrir Mapa Holográfico 2D</span>
          </button>
        </div>
      </div>

      {/* Active Bots Live Bar (if any bot is running) */}
      {activeBots.length > 0 && (
        <div className="p-4 rounded-3xl bg-theme-primary/10 border border-theme-primary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-theme-text">
                {activeBots[0].name} está em execução!
              </span>
              <span className="text-[11px] text-theme-text-muted">
                FPS Captura: {fpsCapture} | Inferência: {fpsInference}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("vision")}
              className="px-3 py-1.5 rounded-xl bg-theme-surface hover:bg-theme-surface-card text-xs font-bold border border-theme-border text-theme-text shadow-sm"
            >
              👁 Ver Visão
            </button>
            <button
              onClick={() => BotManager.stopBot(activeBots[0].id)}
              className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white shadow-soft flex items-center gap-1"
            >
              <Square size={12} /> Parar Bot
            </button>
          </div>
        </div>
      )}

      {/* Favorites Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-theme-text flex items-center gap-2">
            <Heart size={16} className="text-pink-500 fill-pink-500" />
            Seus Favoritos ✨
          </h2>
          <button
            onClick={() => setActiveTab("roblox")}
            className="text-xs font-bold text-theme-primary hover:underline"
          >
            Ver catálogo completo →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoriteBots.map((bot) => {
            const status = botStatus[bot.id] || "stopped";
            const isRunning = status === "running";

            return (
              <div
                key={bot.id}
                className="p-5 rounded-3xl bg-theme-surface border border-theme-border/60 hover:border-pink-300/60 shadow-soft flex flex-col justify-between gap-4 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/15 flex items-center justify-center text-2xl shadow-inner">
                      {bot.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold text-theme-text">
                        {bot.name}
                      </span>
                      <span className="text-[11px] text-theme-text-muted">
                        {bot.game}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFavorite(bot.id)}
                    className="p-2 rounded-xl hover:bg-theme-surface-card text-pink-500 transition-colors"
                  >
                    <Heart size={16} className="fill-pink-500" />
                  </button>
                </div>

                <p className="text-xs text-theme-text-muted line-clamp-2">
                  {bot.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-theme-border/40">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isRunning ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                      }`}
                    />
                    <span className="text-[11px] font-bold text-theme-text capitalize">
                      {status === "stopped"
                        ? "Parado"
                        : status === "running"
                        ? "Rodando"
                        : status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfigModalBotId(bot.id)}
                      className="px-3 py-1.5 rounded-xl bg-theme-surface-card hover:bg-theme-border/60 text-xs font-bold text-theme-text border border-theme-border"
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
                    ) : status === "running" || status === "paused" ? (
                      <button
                        onClick={() => BotManager.stopBot(bot.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white shadow-soft flex items-center gap-1"
                      >
                        <Square size={12} /> Parar
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const cfg = useBotsStore.getState().botConfigs[bot.id] || bot.defaultConfig;
                          BotManager.startBot(bot.id, cfg);
                        }}
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
    </div>
  );
};
