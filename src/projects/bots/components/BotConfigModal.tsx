import React from "react";
import {
  X,
  Sliders,
  Cpu,
  Monitor,
  Shield,
  Eye,
  Crosshair,
  Sparkles,
  Zap,
  Coffee,
  Clock,
  Compass,
  Repeat,
  Timer,
} from "lucide-react";
import { useBotsStore } from "../store/botsStore";
import { BOT_REGISTRY } from "../core/BotRegistry";
import { BotManager } from "../core/BotManager";
import { BotConfig } from "../types";

export const BotConfigModal: React.FC = () => {
  const {
    configModalBotId,
    setConfigModalBotId,
    botConfigs,
    updateBotConfig,
    botStatus,
    discoveredModels,
    setScreenSelectorOpen,
  } = useBotsStore();

  if (!configModalBotId) return null;

  const bot = BOT_REGISTRY.find((b) => b.id === configModalBotId);
  const config = botConfigs[configModalBotId] || bot?.defaultConfig;

  if (!bot || !config) return null;

  const closeModal = () => setConfigModalBotId(null);
  const isHanami = configModalBotId === "roblox-hanami-spirit-collector";
  const isRunning = botStatus[configModalBotId] === "running";

  const patchConfig = (partial: Partial<BotConfig>) => {
    if (isRunning) {
      BotManager.updateRunningConfig(configModalBotId, partial);
    } else {
      updateBotConfig(configModalBotId, partial);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-theme-surface border border-theme-border/80 shadow-2xl p-6 flex flex-col gap-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-theme-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/15 text-pink-500 flex items-center justify-center text-xl shadow-inner">
              {bot.icon}
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-black text-theme-text">
                Configurações: {bot.name}
              </h2>
              <span className="text-xs text-theme-text-muted">
                {isHanami
                  ? "Configurações autônomas de patrulha, coleta de ursos e descanso AFK"
                  : "Ajuste os parâmetros reais do motor de visão e movimentação"}
              </span>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-xl hover:bg-theme-surface-card text-theme-text-muted hover:text-theme-text transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-col gap-5 text-xs">
          {/* 1. Modo Operacional */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-theme-text flex items-center gap-2">
              <Crosshair size={14} className="text-theme-primary" />
              <span>Modo Operacional</span>
            </label>

            {isHanami ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    id: "all_spirits",
                    title: "🌸 Coleta de Ursos (Branco + Preto)",
                    desc: "Patrulha o mapa de Hanami e absorve ambos os ursos mágicos.",
                  },
                  {
                    id: "white_only",
                    title: "🤍 Apenas Ursos Brancos (Sakura)",
                    desc: "Foca unicamente nos ursos brancos brilhantes nas alamedas.",
                  },
                  {
                    id: "black_only",
                    title: "🖤 Apenas Ursos Pretos (Kuro)",
                    desc: "Foca unicamente nos ursos pretos nas sombras e templos.",
                  },
                  {
                    id: "patrol_only",
                    title: "🗺️ Patrulha Livre (rota salva)",
                    desc: "Percorre os waypoints gravados sem parar para absorver.",
                  },
                  {
                    id: "street_mapping",
                    title: "📍 Mapear Ruas (gravar WASD)",
                    desc: "Você anda; o bot grava a rota. F4=ponto | F3=desfazer | END=salvar.",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      patchConfig( {
                        mode: item.id as any,
                      })
                    }
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      (config.mode || "all_spirits") === item.id
                        ? "bg-pink-500/10 border-pink-500 text-theme-text shadow-sm"
                        : "bg-theme-surface-card border-theme-border/60 text-theme-text-muted hover:border-theme-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-theme-text text-xs">
                        {item.title}
                      </span>
                      {(config.mode || "all_spirits") === item.id && (
                        <span className="text-[10px] font-bold text-pink-500">
                          Selecionado
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-theme-text-muted leading-relaxed">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    patchConfig( {
                      mode: "coin_only",
                      weights:
                        discoveredModels.find((m) => m.filename.includes("coin_m"))
                          ?.path || config.weights,
                    })
                  }
                  className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    config.mode === "coin_only"
                      ? "bg-pink-500/10 border-pink-500 text-theme-text shadow-sm"
                      : "bg-theme-surface-card border-theme-border/60 text-theme-text-muted hover:border-theme-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-theme-text">
                      🪙 Apenas Moedas
                    </span>
                    {config.mode === "coin_only" && (
                      <span className="text-[10px] font-bold text-pink-500">
                        Selecionado
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-theme-text-muted leading-relaxed">
                    Detecta moedas no chão e movimenta o personagem em direção a elas.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    patchConfig( {
                      mode: "coin_and_players",
                      weights:
                        discoveredModels.find((m) => m.filename.includes("person"))
                          ?.path || config.weights,
                    })
                  }
                  className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    config.mode === "coin_and_players"
                      ? "bg-pink-500/10 border-pink-500 text-theme-text shadow-sm"
                      : "bg-theme-surface-card border-theme-border/60 text-theme-text-muted hover:border-theme-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-theme-text">
                      🪙 Coleta + Desvio de Jogadores
                    </span>
                    {config.mode === "coin_and_players" && (
                      <span className="text-[10px] font-bold text-pink-500">
                        Selecionado
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-theme-text-muted leading-relaxed">
                    Detecta moedas e outros jogadores. Tenta se afastar de pessoas para não ser assassinado.
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Se for Hanami: Delay de Coleta (Permanência 3 segundos) */}
          {isHanami && (
            <div className="p-4 rounded-2xl bg-theme-surface-card border border-theme-border/50 flex flex-col gap-2">
              <div className="flex items-center justify-between font-bold text-theme-text">
                <span className="flex items-center gap-1.5">
                  <Timer size={14} className="text-pink-500" />
                  <span>Tempo de Permanência para Absorção (Delay de Coleta)</span>
                </span>
                <span className="font-mono text-pink-500 font-extrabold text-sm">
                  {(config.collection_dwell_time || 3.0).toFixed(1)}s
                </span>
              </div>
              <input
                type="range"
                min="1.5"
                max="6.0"
                step="0.1"
                value={config.collection_dwell_time || 3.0}
                onChange={(e) =>
                  patchConfig( {
                    collection_dwell_time: parseFloat(e.target.value),
                  })
                }
                className="accent-pink-500 cursor-pointer"
              />
              <span className="text-[11px] text-theme-text-muted">
                O bot se aproxima do urso e permanece parado por esse tempo para registrar a absorção antes de continuar a patrulha.
              </span>
            </div>
          )}

          {/* Se for Hanami: Sistema de Descanso AFK (Ciclo Seguro - Metade do tempo permitido pelo Roblox) */}
          {isHanami && (
            <div className="p-4 rounded-2xl bg-theme-surface-card border border-pink-500/20 flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-theme-text flex items-center gap-2">
                    <Coffee size={15} className="text-amber-500" />
                    <span>Sistema de Descanso AFK (Ciclo Seguro Anti-Kick)</span>
                  </span>
                  <span className="text-[11px] text-theme-text-muted">
                    O Roblox desconecta por inatividade aos 20 min. O bot trabalha por um período e descansa na metade do tempo permitido (8 a 10 min) com micro anti-kick, repetindo o ciclo.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    patchConfig( {
                      rest_enabled: !(config.rest_enabled ?? true),
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    (config.rest_enabled ?? true) ? "bg-amber-500" : "bg-gray-400"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      (config.rest_enabled ?? true) ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {(config.rest_enabled ?? true) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-theme-border/30">
                  {/* Tempo Ativo / Trabalhando */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between font-bold text-theme-text">
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-emerald-500" />
                        <span>Tempo Ativo (Patrulha & Coleta)</span>
                      </span>
                      <span className="font-mono text-emerald-500 font-bold">
                        {config.work_duration_mins || 10} min
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="1"
                      value={config.work_duration_mins || 10}
                      onChange={(e) =>
                        patchConfig( {
                          work_duration_mins: parseInt(e.target.value, 10),
                        })
                      }
                      className="accent-emerald-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-theme-text-muted">
                      Período contínuo coletando espíritos pelo mapa.
                    </span>
                  </div>

                  {/* Tempo em Descanso */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between font-bold text-theme-text">
                      <span className="flex items-center gap-1.5">
                        <Coffee size={13} className="text-amber-500" />
                        <span>Tempo de Descanso AFK</span>
                      </span>
                      <span className="font-mono text-amber-500 font-bold">
                        {config.rest_duration_mins || 10} min
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="15"
                      step="1"
                      value={config.rest_duration_mins || 10}
                      onChange={(e) =>
                        patchConfig( {
                          rest_duration_mins: parseInt(e.target.value, 10),
                        })
                      }
                      className="accent-amber-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-theme-text-muted">
                      Metade do limite do Roblox (10 min) com anti-kick discreto.
                    </span>
                  </div>

                  {/* Ciclo Info Badge */}
                  <div className="sm:col-span-2 flex items-center justify-between p-2.5 rounded-xl bg-pink-500/5 border border-pink-500/20 text-[11px]">
                    <div className="flex items-center gap-2 text-theme-text font-medium">
                      <Repeat size={14} className="text-pink-500" />
                      <span>
                        Ciclo Automático: <b>{config.work_duration_mins || 10}m</b> trabalho ➔ <b>{config.rest_duration_mins || 10}m</b> descanso seguro ➔ repete para sempre.
                      </span>
                    </div>
                    <span className="font-bold text-emerald-500 text-[10px] uppercase tracking-wide">
                      Anti-Kick Ativo
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Modelo YOLO Selecionado */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-theme-text flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles size={14} className="text-purple-500" />
                <span>Modelo YOLO (Pesos .pt)</span>
              </span>
              <span className="text-[10px] text-theme-text-muted">
                {discoveredModels.length} modelos detectados
              </span>
            </label>
            <select
              value={config.weights}
              onChange={(e) =>
                patchConfig( { weights: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-2xl bg-theme-surface-card border border-theme-border/60 text-theme-text focus:outline-none focus:border-theme-primary font-mono text-xs"
            >
              {isHanami && (
                <option value="yolo_hanami_spirits_v1.pt">
                  Rastreador Nativo de Visão (Sem necessidade de .pt - Ativo)
                </option>
              )}
              {discoveredModels.map((m) => (
                <option key={m.id} value={m.path}>
                  {m.filename} ({m.sizeFormatted}) — {m.classes.join(", ")}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Dispositivo de Processamento */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-theme-text flex items-center gap-2">
              <Cpu size={14} className="text-blue-500" />
              <span>Dispositivo de Inferência</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "auto", label: "Automático (Recomendado)" },
                { id: "cuda", label: "Forçar CUDA (GPU)" },
                { id: "cpu", label: "CPU Fallback" },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() =>
                    patchConfig( { device: d.id as any })
                  }
                  className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                    config.device === d.id
                      ? "bg-theme-primary text-white border-theme-primary shadow-soft"
                      : "bg-theme-surface-card border-theme-border/60 text-theme-text-muted hover:text-theme-text"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Sliders Reais: Confidence Threshold & Pulo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-theme-surface-card border border-theme-border/40">
            {/* Confidence */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between font-bold text-theme-text">
                <span>Limiar de Confiança</span>
                <span className="font-mono text-theme-primary">
                  {Math.round(config.conf_thres * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={config.conf_thres}
                onChange={(e) =>
                  patchConfig({
                    conf_thres: parseFloat(e.target.value),
                  })
                }
                className="accent-theme-primary cursor-pointer"
              />
              <span className="text-[10px] text-theme-text-muted">
                {isHanami
                  ? "Hanami: andando o mapa é o padrão. Slider ~25–35% para ver ursos borrados."
                  : "Valores mais altos evitam falsos positivos."}
              </span>
            </div>

            {/* Jump probability */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between font-bold text-theme-text">
                <span>Frequência de Pulos (Spam Jump)</span>
                <span className="font-mono text-theme-primary">
                  {Math.round(config.jump_prob * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={config.jump_prob}
                onChange={(e) =>
                  patchConfig( {
                    jump_prob: parseFloat(e.target.value),
                  })
                }
                className="accent-theme-primary cursor-pointer"
              />
              <span className="text-[10px] text-theme-text-muted">
                Probabilidade de pressionar Espaço durante o trajeto.
              </span>
            </div>
          </div>

          {/* 5. Simulação Segura e Captura de Tela */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-theme-surface-card border border-theme-border/40">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-theme-text flex items-center gap-1.5">
                  <Shield size={14} className="text-emerald-500" />
                  Modo de Simulação Segura
                </span>
                <span className="text-[11px] text-theme-text-muted">
                  Apenas visualiza e calcula rotas sem pressionar teclas reais no teclado.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  patchConfig( {
                    simulation_mode: !config.simulation_mode,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.simulation_mode ? "bg-emerald-500" : "bg-gray-400"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.simulation_mode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Screen region trigger */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-theme-surface-card border border-theme-border/40">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-theme-text flex items-center gap-1.5">
                  <Monitor size={14} className="text-blue-500" />
                  Área e Monitor de Captura
                </span>
                <span className="text-[11px] text-theme-text-muted">
                  {config.region
                    ? `Região customizada: ${config.region[2]}x${config.region[3]} px`
                    : "Captura automática da janela do Roblox"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  closeModal();
                  setScreenSelectorOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-theme-surface hover:bg-theme-border text-xs font-bold text-theme-text border border-theme-border transition-colors"
              >
                Alterar Área
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-theme-border/60 pt-4">
          <button
            onClick={closeModal}
            className="px-5 py-2.5 rounded-2xl bg-theme-primary hover:bg-theme-primary/90 text-xs font-bold text-white shadow-soft"
          >
            Concluir & Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
