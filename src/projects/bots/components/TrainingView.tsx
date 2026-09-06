import React, { useState } from "react";
import {
  GraduationCap,
  Play,
  Square,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  Activity,
  Box,
  TrendingDown,
  Clock,
  Check,
  Brain,
} from "lucide-react";
import { useBotsStore } from "../store/botsStore";

export const TrainingView: React.FC = () => {
  const { hardwareDevice, addLog, activeLearning } = useBotsStore();

  const [profile, setProfile] = useState<"fast_test" | "balanced" | "full">("balanced");
  const [isTraining, setIsTraining] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [totalEpochs, setTotalEpochs] = useState(100);
  const [currentLoss, setCurrentLoss] = useState(0.85);

  const handleStartTraining = () => {
    const epochs = profile === "fast_test" ? 5 : profile === "balanced" ? 100 : 500;
    setTotalEpochs(epochs);
    setCurrentEpoch(1);
    setIsTraining(true);
    setIsFinished(false);
    addLog("info", `Treinamento YOLOv5 iniciado (Perfil: ${profile}, ${epochs} epochs) ✨`);

    // Simulated progress loop for demo
    const interval = setInterval(() => {
      setCurrentEpoch((prev) => {
        if (prev >= epochs) {
          clearInterval(interval);
          setIsTraining(false);
          setIsFinished(true);
          addLog("info", "Treinamento YOLOv5 concluído com sucesso! Checkpoint: runs/train/exp/weights/best.pt 🧸");
          return epochs;
        }
        setCurrentLoss((l) => +(Math.max(0.08, l - 0.015)).toFixed(3));
        return prev + Math.max(1, Math.floor(epochs / 25));
      });
    }, 600);
  };

  const handleStopTraining = () => {
    setIsTraining(false);
    addLog("warning", "Treinamento interrompido pelo usuário");
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center text-2xl shadow-soft">
            <GraduationCap size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-theme-text">
              Treinamento de Redes Neurais (YOLOv5)
            </h2>
            <span className="text-xs text-theme-text-muted">
              Treine modelos para novos jogos utilizando o pipeline do yolov5_mm2
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-theme-surface-card border border-theme-border/60 text-xs">
          <Cpu size={14} className="text-pink-500" />
          <span className="font-bold text-theme-text">{hardwareDevice || "GPU do Sistema / CPU"}</span>
        </div>
      </div>

      {/* Finished Banner "Modelo prontinho ✨" */}
      {isFinished && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-400/30 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-soft">
              ✨
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-black text-theme-text">
                Modelo prontinho ✨
              </h3>
              <span className="text-xs text-theme-text-muted font-mono">
                Checkpoint salvo em: runs/train/exp/weights/best.pt
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white shadow-soft">
              Registrar no ModelRegistry
            </button>
            <button className="px-4 py-2 rounded-2xl bg-theme-surface text-xs font-bold text-theme-text border border-theme-border hover:bg-theme-surface-card">
              Usar em um Bot
            </button>
          </div>
        </div>
      )}

      {/* Active Learning Continuous Dataset Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 border border-purple-500/20 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 flex-shrink-0">
            <Brain size={22} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-theme-text">Dataset Vivo do Aprendizado Contínuo (Gemini)</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-bold">Online</span>
            </div>
            <p className="text-xs text-theme-text-muted">
              {activeLearning?.samplesCollected || 0} amostras auto-anotadas pelo Gemini durante as sessões de jogo ativas.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            addLog("info", `Incorporando ${activeLearning?.samplesCollected || 0} amostras do aprendizado contínuo ao treino! 🧠✨`);
            handleStartTraining();
          }}
          disabled={isTraining}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex-shrink-0"
        >
          <Sparkles size={14} />
          <span>Treinar com Amostras Vivas</span>
        </button>
      </div>

      {/* Profile Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            id: "fast_test",
            name: "Fast Test",
            epochs: 5,
            batch: 16,
            imgSize: 320,
            desc: "Validação rápida de pipeline em 2 minutos.",
          },
          {
            id: "balanced",
            name: "Balanced (Recomendado)",
            epochs: 100,
            batch: 12,
            imgSize: 640,
            desc: "Equilíbrio entre precisão e tempo de treino.",
          },
          {
            id: "full",
            name: "Full Training (MM2)",
            epochs: 500,
            batch: 12,
            imgSize: 640,
            desc: "Configuração original do autor (alta precisão).",
          },
        ].map((p) => {
          const isSelected = profile === p.id;
          return (
            <div
              key={p.id}
              onClick={() => !isTraining && setProfile(p.id as any)}
              className={`p-5 rounded-3xl bg-theme-surface border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                isSelected
                  ? "border-pink-500 shadow-soft ring-2 ring-pink-400/20"
                  : "border-theme-border/60 hover:border-pink-300/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-extrabold text-theme-text">{p.name}</span>
                  {isSelected && <Check size={16} className="text-pink-500" />}
                </div>
                <p className="text-xs text-theme-text-muted">{p.desc}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-theme-text-muted pt-2 border-t border-theme-border/40">
                <span>{p.epochs} Epochs</span>
                <span>Batch {p.batch}</span>
                <span>{p.imgSize}px</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Training Telemetry Board */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-theme-text flex items-center gap-2">
            <Activity size={16} className="text-pink-500" />
            Progresso do Treinador (yolov5_mm2)
          </h3>

          {isTraining ? (
            <button
              onClick={handleStopTraining}
              className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white shadow-soft flex items-center gap-1"
            >
              <Square size={13} /> Parar Treino
            </button>
          ) : (
            <button
              onClick={handleStartTraining}
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-xs font-black text-white shadow-soft flex items-center gap-1.5 active:scale-95"
            >
              <Play size={13} className="fill-white" /> Iniciar Treinamento
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-theme-text">
              Época Atual: {currentEpoch} / {totalEpochs}
            </span>
            <span className="text-theme-primary font-mono">
              {Math.round((currentEpoch / totalEpochs) * 100)}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-theme-surface-card overflow-hidden border border-theme-border/40">
            <div
              style={{ width: `${(currentEpoch / totalEpochs) * 100}%` }}
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
            />
          </div>
        </div>

        {/* Real-time Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col">
            <span className="text-[10px] text-theme-text-muted">Dataset</span>
            <span className="font-bold text-theme-text font-mono truncate">data/mm2.yaml</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col">
            <span className="text-[10px] text-theme-text-muted">Pesos Base</span>
            <span className="font-bold text-theme-text font-mono truncate">yolov5m.pt</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col">
            <span className="text-[10px] text-theme-text-muted">Loss (Perda)</span>
            <span className="font-bold text-emerald-500 font-mono text-sm">{currentLoss}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col">
            <span className="text-[10px] text-theme-text-muted">Checkpoint Atual</span>
            <span className="font-bold text-theme-primary font-mono truncate">runs/train/exp</span>
          </div>
        </div>
      </div>
    </div>
  );
};
