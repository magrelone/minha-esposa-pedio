import React, { useState } from "react";
import {
  Settings,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Cpu,
  Activity,
  Zap,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAutoClickStore } from "../store/autoclickStore";
import { HotkeyService } from "@/core/services/automation/HotkeyService";

export const SettingsView: React.FC = () => {
  const {
    hotkeyStartStop,
    hotkeyEmergencyStop,
    hotkeyPickPosition,
    setHotkeys,
    cornerFailsafe,
    setCornerFailsafe,
    simulationMode,
    setSimulationMode,
    diagnostics,
    realCps,
    cps,
    timerDriftMs,
  } = useAutoClickStore();

  const [editingKey, setEditingKey] = useState<string | null>(null);

  const handleSetKey = async (type: "startStop" | "emergency" | "pick", val: string) => {
    const upper = val.toUpperCase().trim();
    if (!upper) return;

    await HotkeyService.register(upper);
    if (type === "startStop") setHotkeys({ startStop: upper });
    if (type === "emergency") setHotkeys({ emergency: upper });
    if (type === "pick") setHotkeys({ pick: upper });
    setEditingKey(null);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center text-2xl shadow-soft">
            <Settings size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-theme-text">Configurações & Failsafes de Segurança</h2>
            <span className="text-xs text-theme-text-muted">
              Ajuste atalhos globais de teclado, proteções de emergência e diagnóstico técnico
            </span>
          </div>
        </div>
      </div>

      {/* Global Hotkeys Card */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-4">
        <span className="text-xs font-black text-theme-text uppercase">Atalhos Globais do Sistema</span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Start/Stop */}
          <div className="p-4 rounded-2xl bg-theme-surface-card border border-theme-border/50 flex flex-col justify-between gap-3">
            <div className="flex flex-col">
              <span className="font-bold text-theme-text">Iniciar / Parar</span>
              <span className="text-[10px] text-theme-text-muted">Alterna o clique em qualquer jogo</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={hotkeyStartStop}
                onChange={(e) => handleSetKey("startStop", e.target.value)}
                className="w-24 p-1.5 rounded-xl bg-theme-surface border border-theme-border/60 font-mono font-bold text-center text-xs text-pink-500 focus:outline-none"
              />
              <span className="text-[10px] text-theme-text-muted">Ativo</span>
            </div>
          </div>

          {/* Emergency Stop */}
          <div className="p-4 rounded-2xl bg-theme-surface-card border border-theme-border/50 flex flex-col justify-between gap-3">
            <div className="flex flex-col">
              <span className="font-bold text-theme-text text-red-500 flex items-center gap-1">
                <ShieldAlert size={14} /> Parada de Pânico
              </span>
              <span className="text-[10px] text-theme-text-muted">Cancela fila e solta todas as teclas</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={hotkeyEmergencyStop}
                onChange={(e) => handleSetKey("emergency", e.target.value)}
                className="w-24 p-1.5 rounded-xl bg-theme-surface border border-theme-border/60 font-mono font-bold text-center text-xs text-red-500 focus:outline-none"
              />
              <span className="text-[10px] text-theme-text-muted">Panic Key</span>
            </div>
          </div>

          {/* Pick Position */}
          <div className="p-4 rounded-2xl bg-theme-surface-card border border-theme-border/50 flex flex-col justify-between gap-3">
            <div className="flex flex-col">
              <span className="font-bold text-theme-text">Capturar Coordenada</span>
              <span className="text-[10px] text-theme-text-muted">Captura onde o cursor estiver</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={hotkeyPickPosition}
                onChange={(e) => handleSetKey("pick", e.target.value)}
                className="w-24 p-1.5 rounded-xl bg-theme-surface border border-theme-border/60 font-mono font-bold text-center text-xs text-theme-text focus:outline-none"
              />
              <span className="text-[10px] text-theme-text-muted">Ativo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Failsafes */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-4">
        <span className="text-xs font-black text-theme-text uppercase">Failsafes & Proteções Automáticas</span>

        <div className="flex flex-col gap-3 text-xs">
          <label className="flex items-start gap-3 p-4 rounded-2xl bg-theme-surface-card border border-theme-border/50 cursor-pointer hover:border-pink-300">
            <input
              type="checkbox"
              checked={cornerFailsafe}
              onChange={(e) => setCornerFailsafe(e.target.checked)}
              className="mt-0.5 rounded accent-pink-500 w-4 h-4"
            />
            <div className="flex flex-col">
              <span className="font-bold text-theme-text">Canto da Tela (Corner Failsafe)</span>
              <span className="text-[11px] text-theme-text-muted">
                Se você empurrar o mouse rapidamente para o canto superior esquerdo da tela (0, 0), o auto clicker é imediatamente interrompido e todas as teclas são soltas.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-2xl bg-theme-surface-card border border-theme-border/50 cursor-pointer hover:border-pink-300">
            <input
              type="checkbox"
              checked={simulationMode}
              onChange={(e) => setSimulationMode(e.target.checked)}
              className="mt-0.5 rounded accent-pink-500 w-4 h-4"
            />
            <div className="flex flex-col">
              <span className="font-bold text-theme-text">Modo de Simulação / Teste (Test Mode)</span>
              <span className="text-[11px] text-theme-text-muted">
                Executa o timer e gera telemetria sem disparar cliques físicos ou teclas no Windows. Ideal para testar sequências complexas sem clicar acidentalmente.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Advanced Diagnostics Card */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-theme-border/40 pb-3">
          <Cpu size={18} className="text-purple-500" />
          <h3 className="text-sm font-extrabold text-theme-text">Diagnóstico Técnico (Developer Mode)</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col">
            <span className="text-[10px] text-theme-text-muted font-bold">CPS Alvo vs Real</span>
            <span className="text-base font-black text-theme-text font-mono mt-0.5">
              {realCps} / {cps} CPS
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col">
            <span className="text-[10px] text-theme-text-muted font-bold">Drift de Temporizador</span>
            <span className="text-base font-black text-emerald-500 font-mono mt-0.5">
              {timerDriftMs} ms
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col">
            <span className="text-[10px] text-theme-text-muted font-bold">Latência do Evento</span>
            <span className="text-base font-black text-theme-text font-mono mt-0.5">
              {diagnostics.eventLatencyMs} ms
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col">
            <span className="text-[10px] text-theme-text-muted font-bold">Motor Nativo</span>
            <span className="text-xs font-bold text-pink-500 mt-1">
              Win32 SendInput (Rust)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
