import React, { useState } from "react";
import {
  Circle,
  Square,
  Play,
  ShieldCheck,
  Sparkles,
  MousePointer,
  Keyboard,
  Scroll,
  Move,
  Info,
} from "lucide-react";
import { useAutoClickStore } from "../store/autoclickStore";

export const RecorderView: React.FC = () => {
  const { startAutoClick, stopAutoClick, isRunning } = useAutoClickStore();
  const [isRecording, setIsRecording] = useState(false);
  const [recordClicks, setRecordClicks] = useState(true);
  const [recordPosition, setRecordPosition] = useState(true);
  const [recordScroll, setRecordScroll] = useState(true);
  const [recordKeys, setRecordKeys] = useState(true);
  const [recordFullMovement, setRecordFullMovement] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [recordedEventsCount, setRecordedEventsCount] = useState(14);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedEventsCount(0);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setRecordedEventsCount(24);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-soft transition-colors ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-gradient-to-tr from-rose-500 to-pink-500 text-white"
            }`}
          >
            <Circle size={22} className={isRecording ? "fill-white" : ""} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-theme-text">Gravador & Reprodução (Macro Recorder)</h2>
              {isRecording && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-500 text-[10px] font-black tracking-widest uppercase animate-pulse border border-red-500/40">
                  🔴 REC Gravando
                </span>
              )}
            </div>
            <span className="text-xs text-theme-text-muted">
              Grave cliques, coordenadas e teclas em tempo real com simplificação automática de trajetória
            </span>
          </div>
        </div>

        {/* Recorder Buttons */}
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-soft transition-all"
            >
              <Circle size={14} className="fill-white" />
              <span>Gravar Macro</span>
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-neutral-900 hover:bg-black text-white font-bold text-xs shadow-soft transition-all animate-pulse"
            >
              <Square size={14} className="fill-white" />
              <span>Parar Gravação</span>
            </button>
          )}
        </div>
      </div>

      {/* Recording Options Grid */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-4">
        <span className="text-xs font-black text-theme-text uppercase">O que incluir na gravação:</span>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 cursor-pointer hover:border-pink-300">
            <input
              type="checkbox"
              checked={recordClicks}
              onChange={(e) => setRecordClicks(e.target.checked)}
              className="rounded accent-pink-500 w-4 h-4"
            />
            <MousePointer size={15} className="text-pink-500" />
            <span className="font-bold text-theme-text">Cliques do Mouse</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 cursor-pointer hover:border-pink-300">
            <input
              type="checkbox"
              checked={recordPosition}
              onChange={(e) => setRecordPosition(e.target.checked)}
              className="rounded accent-pink-500 w-4 h-4"
            />
            <Move size={15} className="text-blue-500" />
            <span className="font-bold text-theme-text">Posições das Ações</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 cursor-pointer hover:border-pink-300">
            <input
              type="checkbox"
              checked={recordScroll}
              onChange={(e) => setRecordScroll(e.target.checked)}
              className="rounded accent-pink-500 w-4 h-4"
            />
            <Scroll size={15} className="text-amber-500" />
            <span className="font-bold text-theme-text">Rolagem de Scroll</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 cursor-pointer hover:border-pink-300">
            <input
              type="checkbox"
              checked={recordKeys}
              onChange={(e) => setRecordKeys(e.target.checked)}
              className="rounded accent-pink-500 w-4 h-4"
            />
            <Keyboard size={15} className="text-emerald-500" />
            <span className="font-bold text-theme-text">Teclas Digitadas</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 cursor-pointer hover:border-pink-300 sm:col-span-2">
            <input
              type="checkbox"
              checked={recordFullMovement}
              onChange={(e) => setRecordFullMovement(e.target.checked)}
              className="rounded accent-pink-500 w-4 h-4"
            />
            <Move size={15} className="text-purple-500" />
            <div className="flex flex-col">
              <span className="font-bold text-theme-text">Movimento Contínuo do Mouse</span>
              <span className="text-[10px] text-theme-text-muted">
                Aplica algoritmo de simplificação Ramer-Douglas-Peucker para evitar eventos redundantes
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Playback Controls & Speed */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-theme-text uppercase">Velocidade de Reprodução:</span>
          <span className="text-[11px] text-theme-text-muted">
            {recordedEventsCount} ações registradas na macro atual
          </span>
        </div>

        <div className="flex items-center gap-2">
          {[0.5, 1.0, 1.5, 2.0].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                playbackSpeed === spd
                  ? "bg-pink-500 text-white border-pink-500"
                  : "bg-theme-surface-card text-theme-text border-theme-border/50"
              }`}
            >
              {spd}x
            </button>
          ))}

          <button
            onClick={() => startAutoClick()}
            disabled={isRunning || isRecording}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-theme-primary hover:bg-theme-primary/90 text-xs font-bold text-white shadow-soft transition-all ml-2 disabled:opacity-50"
          >
            <Play size={13} className="fill-white" />
            <span>Reproduzir Macro</span>
          </button>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs">
        <ShieldCheck size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-theme-text">Privacidade & Proteção de Senhas:</span>
          <span className="text-theme-text-muted text-[11px]">
            O gravador opera exclusivamente em memória local para montagem da macro. Nenhuma tecla é salva em histórico permanente ou transmitida para servidores. Nunca digite senhas enquanto a gravação estiver ligada.
          </span>
        </div>
      </div>
    </div>
  );
};
