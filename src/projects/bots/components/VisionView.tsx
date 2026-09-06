import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Crosshair,
  Cpu,
  Layers,
  Activity,
  Sliders,
  Maximize2,
  Scan,
  Sparkles,
  Brain,
  Zap,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useBotsStore } from "../store/botsStore";
import { BotManager } from "../core/BotManager";

export const VisionView: React.FC = () => {
  const {
    previewImage,
    latestDetections,
    fpsCapture,
    fpsInference,
    detectedCoins,
    detectedPlayers,
    lastAction,
    hardwareDevice,
    botConfigs,
    activeBotId,
    botStatus,
    updateBotConfig,
    setScreenSelectorOpen,
    activeLearning,
    setActiveLearningEnabled,
  } = useBotsStore();

  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);

  const currentBotId = activeBotId || "roblox-mm2-coin-collector";
  const config = botConfigs[currentBotId];
  const isRunning = botStatus[currentBotId] === "running";
  const isHanami = currentBotId === "roblox-hanami-spirit-collector";

  const selectedModelName = config?.weights
    ? config.weights.split(/[\\/]/).pop()
    : "yolo11_roblox_official.pt";

  const pushConfig = (partial: Parameters<typeof updateBotConfig>[1]) => {
    if (isRunning) {
      BotManager.updateRunningConfig(currentBotId, partial);
    } else {
      updateBotConfig(currentBotId, partial);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-xl shadow-inner">
            <Eye size={22} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-theme-text flex items-center gap-2">
              Visão do Bot
              {isRunning && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </h2>
            <span className="text-xs text-theme-text-muted">
              Visualização computacional em tempo real e detecção YOLO
            </span>
          </div>
        </div>

        {/* Preview & Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Preview */}
          <button
            onClick={() =>
              pushConfig({
                send_preview: !config?.send_preview,
              })
            }
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
              config?.send_preview
                ? "bg-blue-500 text-white border-blue-500 shadow-soft"
                : "bg-theme-surface-card text-theme-text-muted border-theme-border"
            }`}
          >
            {config?.send_preview ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>Preview {config?.send_preview ? "Ligado" : "Desligado"}</span>
          </button>

          {/* Toggle BBoxes */}
          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
              showBoundingBoxes
                ? "bg-purple-500 text-white border-purple-500 shadow-soft"
                : "bg-theme-surface-card text-theme-text-muted border-theme-border"
            }`}
          >
            <Crosshair size={14} />
            <span>Bounding Boxes</span>
          </button>

          {/* Screen Region Selector Trigger */}
          <button
            onClick={() => setScreenSelectorOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-theme-surface-card hover:bg-theme-border text-xs font-bold text-theme-text border border-theme-border shadow-sm transition-colors"
          >
            <Scan size={14} />
            <span>Área de Captura</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Screen Viewport + Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Viewport Canvas / Video Mock */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-black/90 border border-theme-border/80 shadow-soft flex items-center justify-center group select-none">
            {/* Real Stream Image if available */}
            {config?.send_preview && previewImage ? (
              <img
                src={previewImage}
                alt="Stream do Bot"
                className="w-full h-full object-contain"
              />
            ) : (
              /* High-tech Placeholder when stream is off or waiting */
              <div className="flex flex-col items-center justify-center gap-3 text-center p-6">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Scan size={32} className="animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">
                    {isRunning
                      ? config?.send_preview
                        ? "Aguardando frames do Roblox..."
                        : "Preview de vídeo desligado para economizar recursos"
                      : "Bot parado. Inicie o bot para ativar a visão 🧸"}
                  </span>
                  <span className="text-xs text-gray-400 mt-1 max-w-sm">
                    {isRunning && !config?.send_preview
                      ? "O bot continua processando detecções em background."
                      : "A tela selecionada será analisada por redes neurais (Ultralytics YOLO11 Oficial)."}
                  </span>
                </div>
              </div>
            )}

            {/* Bounding Boxes Overlay for active detections (chips) */}
            {showBoundingBoxes && latestDetections.length > 0 && (
              <div className="absolute inset-0 pointer-events-none p-4">
                {latestDetections.map((det, idx) => {
                  const isCoin =
                    det.label.toLowerCase().includes("coin") ||
                    det.label.toLowerCase().includes("moeda");
                  const isSpirit =
                    det.label.toLowerCase().includes("urso") ||
                    det.label.toLowerCase().includes("sakura") ||
                    det.label.toLowerCase().includes("kuro");
                  return (
                    <div
                      key={idx}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black shadow-md m-1 backdrop-blur-md border ${
                        isCoin
                          ? "bg-amber-500/90 text-black border-amber-300"
                          : isSpirit
                          ? "bg-pink-500/90 text-white border-pink-300"
                          : "bg-rose-600/90 text-white border-rose-300"
                      }`}
                    >
                      <span>{isCoin ? "🪙" : isSpirit ? "🌸" : "👤"}</span>
                      <span>{det.label.toUpperCase()}</span>
                      {showConfidence && (
                        <span className="font-mono text-[10px] opacity-90">
                          {Math.round(det.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Live HUD Watermark */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white/80 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                FPS: {fpsCapture} cap / {fpsInference} inf
              </span>
              <span>•</span>
              <span>{hardwareDevice || "GPU do Sistema / CPU"}</span>
            </div>
          </div>

          {/* Quick Confidence Threshold Slider */}
          <div className="p-4 rounded-2xl bg-theme-surface border border-theme-border/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-theme-text">
              <Sliders size={14} className="text-theme-primary" />
              <span>Limiar de Confiança (Confidence):</span>
            </div>
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={config?.conf_thres || 0.25}
                onChange={(e) =>
                  pushConfig({
                    conf_thres: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-theme-primary cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-theme-primary w-10 text-right">
                {Math.round((config?.conf_thres || 0.25) * 100)}%
              </span>
            </div>
          </div>
          {isHanami && (
            <p className="text-[11px] text-theme-text-muted px-1">
              Hanami: o bot anda o circuito sempre. Modelo: yolo11_hanami_spirits.pt.
              Para gravar rotas sem bater em parede: modo <b>Mapear Ruas</b> — F4=ponto, F3=desfazer, END=salvar.
            </p>
          )}
        </div>

        {/* Right 1 Col: Real-time Telemetry Panel */}
        <div className="flex flex-col gap-4">
          <div className="p-5 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-4">
            <h3 className="text-sm font-black text-theme-text flex items-center gap-2">
              <Activity size={16} className="text-pink-500" />
              Telemetria em Tempo Real
            </h3>

            <div className="flex flex-col gap-3">
              {/* Bot Status */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 text-xs">
                <span className="text-theme-text-muted">Status do Bot</span>
                <span
                  className={`font-black capitalize ${
                    isRunning ? "text-emerald-500" : "text-gray-500"
                  }`}
                >
                  ● {isRunning ? "Rodando" : "Parado"}
                </span>
              </div>

              {/* Model */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 text-xs">
                <span className="text-theme-text-muted">Modelo</span>
                <span className="font-mono font-bold text-theme-text truncate max-w-[140px]">
                  {selectedModelName}
                </span>
              </div>

              {/* Hardware Device */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 text-xs">
                <span className="text-theme-text-muted">Dispositivo</span>
                <span className="font-bold text-theme-primary truncate max-w-[140px]">
                  {hardwareDevice || "GPU do Sistema / CPU"}
                </span>
              </div>

              {/* FPS Metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col">
                  <span className="text-[10px] text-theme-text-muted">FPS Captura</span>
                  <span className="text-base font-black text-theme-text font-mono">
                    {fpsCapture}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col">
                  <span className="text-[10px] text-theme-text-muted">FPS Inferência</span>
                  <span className="text-base font-black text-theme-text font-mono">
                    {fpsInference}
                  </span>
                </div>
              </div>

              {/* Detections Counts */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300">
                    {isHanami ? "Ursos Brancos" : "Moedas Detectadas"}
                  </span>
                  <span className="text-lg font-black text-amber-500 font-mono">
                    {detectedCoins}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col">
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-300">
                    {isHanami ? "Ursos Pretos" : "Jogadores Próximos"}
                  </span>
                  <span className="text-lg font-black text-rose-500 font-mono">
                    {detectedPlayers}
                  </span>
                </div>
              </div>

              {/* Last Action */}
              <div className="p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col gap-1">
                <span className="text-[10px] text-theme-text-muted">Última Ação</span>
                <span className="text-xs font-semibold text-theme-text line-clamp-2">
                  {lastAction || "Aguardando objetos ou comando..."}
                </span>
              </div>
            </div>
          </div>

          {/* Continuous Online Learning Card (Google Gemini 2.0 Flash) */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-theme-surface via-theme-surface to-purple-500/5 border border-theme-border/60 shadow-soft flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-500">
                  <Brain size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-theme-text">Aprendizado Contínuo</span>
                  <span className="text-[10px] text-theme-text-muted">Google Gemini 2.0 Flash</span>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeLearning?.enabled ?? true}
                  onChange={(e) => {
                    setActiveLearningEnabled(e.target.checked);
                    pushConfig({ active_learning: e.target.checked });
                  }}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 text-xs">
              <span className="text-theme-text-muted">Status do Aprendizado</span>
              {isRunning && activeLearning?.enabled ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Aprendendo ao Vivo ✨
                </span>
              ) : (
                <span className="text-xs font-semibold text-gray-400">
                  {activeLearning?.enabled ? "Pronto p/ rodar" : "Pausado"}
                </span>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col">
                <span className="text-[10px] text-theme-text-muted">Amostras Auto-Anotadas</span>
                <span className="text-sm font-black text-theme-text font-mono">
                  {activeLearning?.samplesCollected || 0} frames
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col">
                <span className="text-[10px] text-theme-text-muted">Cota Gratuita</span>
                <span className="text-sm font-black text-purple-500 font-mono">
                  {activeLearning?.quota?.requests_today || 0}/1.500 dia
                </span>
              </div>
            </div>

            <p className="text-[11px] text-theme-text-muted leading-relaxed">
              💡 Enquanto o bot joga, o Gemini analisa frames desafiadores em segundo plano e auto-anota os dados no dataset, servindo também como oráculo visual!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
