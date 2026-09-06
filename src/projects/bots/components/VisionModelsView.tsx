import React, { useState } from "react";
import {
  Box,
  RefreshCw,
  Cpu,
  Layers,
  CheckCircle2,
  FolderOpen,
  Calendar,
  Sparkles,
  Scan,
} from "lucide-react";
import { useBotsStore } from "../store/botsStore";
import { BotManager } from "../core/BotManager";
import { ModelTesterModal } from "./ModelTesterModal";

export const VisionModelsView: React.FC = () => {
  const {
    discoveredModels,
    isLoadingModels,
    botConfigs,
    activeBotId,
    updateBotConfig,
  } = useBotsStore();

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [selectedModelToTest, setSelectedModelToTest] = useState<string | null>(null);

  const currentBotId = activeBotId || "roblox-mm2-coin-collector";
  const currentWeights = botConfigs[currentBotId]?.weights;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center text-2xl shadow-inner">
            🧠
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-theme-text flex items-center gap-2">
              Modelos de Visão Computacional
            </h2>
            <span className="text-xs text-theme-text-muted">
              Redes neurais YOLOv5 descobertas dinamicamente no projeto
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedModelToTest(null);
              setTestModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-xs font-bold text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-sm transition-colors"
          >
            <Scan size={14} />
            <span>Testar Inferência</span>
          </button>

          <button
            onClick={() => BotManager.refreshModels()}
            disabled={isLoadingModels}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-theme-surface hover:bg-theme-surface-card text-xs font-bold text-theme-text border border-theme-border/60 shadow-sm transition-colors"
          >
            <RefreshCw
              size={14}
              className={isLoadingModels ? "animate-spin text-theme-primary" : ""}
            />
            <span>Redescobrir Pesos</span>
          </button>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {discoveredModels.map((model) => {
          const isCurrentActive = currentWeights && currentWeights.includes(model.filename);

          return (
            <div
              key={model.id}
              className={`p-6 rounded-3xl bg-theme-surface border transition-all flex flex-col justify-between gap-5 ${
                isCurrentActive
                  ? "border-pink-500 shadow-soft ring-2 ring-pink-400/20"
                  : "border-theme-border/60 hover:border-pink-300/40 shadow-soft"
              }`}
            >
              <div className="flex flex-col gap-3">
                {/* Top Row: File Name & Size */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-theme-text px-3 py-1 rounded-xl bg-theme-surface-card border border-theme-border/60">
                      {model.filename}
                    </span>
                    {isCurrentActive && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-500 text-white flex items-center gap-1">
                        <Sparkles size={10} /> Em uso
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono">
                    {model.sizeFormatted}
                  </span>
                </div>

                {/* Metadata Table / Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-theme-text-muted font-bold">
                      Provedor
                    </span>
                    <span className="font-semibold text-theme-text truncate">
                      {model.provider}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] text-theme-text-muted font-bold">
                      Compatibilidade
                    </span>
                    <span className="font-semibold text-theme-primary">
                      {model.deviceSupport}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] text-theme-text-muted font-bold">
                      Data Descoberta
                    </span>
                    <span className="font-semibold text-theme-text">
                      {model.dateDiscovered}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] text-theme-text-muted font-bold">
                      Status
                    </span>
                    <span className="font-semibold text-emerald-500">
                      {model.status}
                    </span>
                  </div>
                </div>

                {/* Detectable Classes */}
                <div className="flex flex-col gap-1.5 pt-2">
                  <span className="text-[10px] text-theme-text-muted font-bold uppercase">
                    Objetos Detectáveis
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {model.classes.map((c, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-theme-surface-card text-theme-text border border-theme-border/60"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Path display */}
                <div className="flex flex-col gap-0.5 pt-1">
                  <span className="text-[10px] text-theme-text-muted font-bold">
                    Localização no Disco
                  </span>
                  <span className="text-[10px] font-mono text-theme-text-muted truncate bg-theme-surface-card p-2 rounded-xl border border-theme-border/40">
                    {model.path}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Action Buttons */}
              <div className="pt-2 border-t border-theme-border/40 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedModelToTest(model.filename);
                    setTestModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-surface-card hover:bg-theme-border/60 text-xs font-bold text-theme-text transition-all"
                >
                  <Scan size={13} className="text-purple-500" />
                  <span>Testar</span>
                </button>

                <button
                  onClick={() => {
                    const isHanamiModel = /hanami|spirit|urso/i.test(model.filename);
                    const isHanamiBot = currentBotId === "roblox-hanami-spirit-collector";
                    updateBotConfig(currentBotId, {
                      weights: model.path,
                      mode: isHanamiBot || isHanamiModel
                        ? "all_spirits"
                        : model.filename.includes("person")
                        ? "coin_and_players"
                        : "coin_only",
                      ...(isHanamiBot || isHanamiModel
                        ? { conf_thres: 0.28, patrol_when_empty: true }
                        : {}),
                    });
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                    isCurrentActive
                      ? "bg-theme-surface-card text-theme-text-muted cursor-default"
                      : "bg-theme-primary hover:bg-theme-primary/90 text-white shadow-soft"
                  }`}
                >
                  {isCurrentActive ? "Modelo Selecionado" : "Selecionar Modelo"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Tester Modal */}
      <ModelTesterModal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
      />
    </div>
  );
};
