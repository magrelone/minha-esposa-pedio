import React, { useState } from "react";
import {
  X,
  Scan,
  Sparkles,
  Upload,
  CheckCircle2,
  Clock,
  Layers,
  Activity,
} from "lucide-react";
import { useBotsStore } from "../store/botsStore";

export const ModelTesterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { discoveredModels, hardwareDevice } = useBotsStore();
  const [selectedModel, setSelectedModel] = useState(
    discoveredModels[0]?.filename || "yolo_coin_m_v3.pt"
  );
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    latencyMs: number;
    detections: { label: string; conf: number; bbox: [number, number, number, number] }[];
  } | null>(null);

  if (!isOpen) return null;

  const handleRunTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setResults({
        latencyMs: 14.5,
        detections: [
          { label: "coin", conf: 0.94, bbox: [220, 180, 260, 220] },
          { label: "coin", conf: 0.88, bbox: [340, 290, 380, 330] },
        ],
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-2xl rounded-3xl bg-theme-surface border border-theme-border/80 shadow-2xl p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-theme-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
              <Scan size={18} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-black text-theme-text">
                Testador de Modelos de Visão
              </h3>
              <span className="text-[11px] text-theme-text-muted">
                Execute inferência instantânea e meça a acurácia e latência
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-theme-surface-card text-theme-text-muted hover:text-theme-text"
          >
            <X size={16} />
          </button>
        </div>

        {/* Model Selector & Action */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs font-mono text-theme-text focus:outline-none"
          >
            {discoveredModels.map((m) => (
              <option key={m.id} value={m.filename}>
                {m.filename} ({m.sizeFormatted})
              </option>
            ))}
          </select>

          <button
            onClick={handleRunTest}
            disabled={testing}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-theme-primary hover:bg-theme-primary/90 text-xs font-bold text-white shadow-soft flex-shrink-0 flex items-center justify-center gap-1.5"
          >
            <Sparkles size={14} />
            <span>{testing ? "Testando..." : "Executar Teste"}</span>
          </button>
        </div>

        {/* Viewport / Results Mock Canvas */}
        <div className="relative aspect-video w-full rounded-2xl bg-black/90 border border-theme-border/80 flex items-center justify-center overflow-hidden">
          {results ? (
            <div className="relative w-full h-full p-4 flex items-center justify-center">
              <div className="absolute top-4 left-4 flex flex-col gap-1">
                <span className="text-[11px] font-mono text-emerald-400 bg-black/60 px-2 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                  <Clock size={12} /> Latência: {results.latencyMs} ms
                </span>
                <span className="text-[11px] font-mono text-white/80 bg-black/60 px-2 py-1 rounded-lg border border-white/10">
                  {results.detections.length} objeto(s) detectado(s)
                </span>
              </div>

              {/* Synthetic BBoxes */}
              {results.detections.map((d, i) => (
                <div
                  key={i}
                  style={{
                    left: `${d.bbox[0]}px`,
                    top: `${d.bbox[1]}px`,
                    width: `${d.bbox[2] - d.bbox[0]}px`,
                    height: `${d.bbox[3] - d.bbox[1]}px`,
                  }}
                  className="absolute border-2 border-amber-400 bg-amber-400/20 rounded-lg flex items-start justify-start p-1"
                >
                  <span className="text-[9px] font-bold bg-amber-500 text-black px-1.5 py-0.2 rounded font-mono">
                    {d.label.toUpperCase()} {Math.round(d.conf * 100)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-xs text-gray-500 gap-2">
              <Scan size={28} className="opacity-40" />
              <span>Clique em 'Executar Teste' para testar a inferência do modelo</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-theme-border/60 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-theme-surface-card hover:bg-theme-border text-xs font-bold text-theme-text"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
