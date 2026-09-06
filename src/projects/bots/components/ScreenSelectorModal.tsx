import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Monitor,
  Crop,
  Check,
  RotateCcw,
  Sparkles,
  Maximize2,
  Square,
  Gamepad2,
  Layers,
  RefreshCw,
  AppWindow,
  Tv,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useBotsStore } from "../store/botsStore";
import { BotManager } from "../core/BotManager";

interface ScannedWindow {
  hwnd: number;
  title: string;
  width: number;
  height: number;
  is_roblox: boolean;
  is_game: boolean;
  category: string;
}

interface ScannedMonitor {
  id: number;
  name: string;
  width: number;
  height: number;
  left?: number;
  top?: number;
  is_primary?: boolean;
}

export const ScreenSelectorModal: React.FC = () => {
  const {
    screenSelectorOpen,
    setScreenSelectorOpen,
    botConfigs,
    activeBotId,
    updateBotConfig,
  } = useBotsStore();

  const currentBotId = activeBotId || "roblox-mm2-coin-collector";
  const config = botConfigs[currentBotId];

  // Discord-style Navigation Tab: "windows" | "screens" | "region"
  const [activeTab, setActiveTab] = useState<"windows" | "screens" | "region">(
    config?.capture_mode === "region"
      ? "region"
      : config?.capture_mode === "fullscreen"
      ? "screens"
      : "windows"
  );

  const [scannedWindows, setScannedWindows] = useState<ScannedWindow[]>([]);
  const [scannedMonitors, setScannedMonitors] = useState<ScannedMonitor[]>([
    { id: 0, name: "Monitor 1 (Principal)", width: 1920, height: 1080, is_primary: true },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedWindowHwnd, setSelectedWindowHwnd] = useState<number | null>(null);
  const [selectedWindowTitle, setSelectedWindowTitle] = useState<string>(
    config?.window_title || "Roblox"
  );
  const [selectedMonitor, setSelectedMonitor] = useState<number>(
    config?.monitor_index || 0
  );
  const [captureMode, setCaptureMode] = useState<"auto" | "window" | "region" | "fullscreen">(
    config?.capture_mode || "window"
  );

  // Region bounds
  const [coords, setCoords] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>(() => {
    if (config?.region) {
      return {
        x: config.region[0],
        y: config.region[1],
        width: config.region[2],
        height: config.region[3],
      };
    }
    return { x: 100, y: 100, width: 800, height: 600 };
  });

  // Interactive canvas dragging
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const previewBoxRef = useRef<HTMLDivElement>(null);

  // Load windows and real monitors when modal opens
  const refreshTargets = async () => {
    setIsLoading(true);
    try {
      const data: any = await invoke("bot_list_capture_targets");
      if (data) {
        if (Array.isArray(data.monitors) && data.monitors.length > 0) {
          setScannedMonitors(data.monitors);
        }
        if (Array.isArray(data.windows)) {
          setScannedWindows(data.windows);
          // Auto-select Roblox if found
          const rbx = data.windows.find((w: ScannedWindow) => w.is_roblox);
          if (rbx) {
            setSelectedWindowHwnd(rbx.hwnd);
            setSelectedWindowTitle(rbx.title);
          }
        }
      }
    } catch (e) {
      // Fallback mock if running in browser dev
      setScannedWindows([
        {
          hwnd: 6949078,
          title: "Roblox",
          width: 1936,
          height: 1048,
          is_roblox: true,
          is_game: true,
          category: "Jogo",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (screenSelectorOpen) {
      refreshTargets();
    }
  }, [screenSelectorOpen]);

  if (!screenSelectorOpen) return null;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTab !== "region" || !previewBoxRef.current) return;
    const rect = previewBoxRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setIsDrawing(true);
    setStartPos({ x, y });
    setCoords({ x, y, width: 10, height: 10 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !previewBoxRef.current) return;
    const rect = previewBoxRef.current.getBoundingClientRect();
    const curX = Math.round(e.clientX - rect.left);
    const curY = Math.round(e.clientY - rect.top);

    const minX = Math.max(0, Math.min(startPos.x, curX));
    const minY = Math.max(0, Math.min(startPos.y, curY));
    const width = Math.min(rect.width - minX, Math.abs(curX - startPos.x));
    const height = Math.min(rect.height - minY, Math.abs(curY - startPos.y));

    setCoords({
      x: minX,
      y: minY,
      width: Math.max(20, width),
      height: Math.max(20, height),
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleSelectWindow = (win: ScannedWindow) => {
    setSelectedWindowHwnd(win.hwnd);
    setSelectedWindowTitle(win.title);
    setCaptureMode("window");
  };

  const handleSelectMonitor = (mon: ScannedMonitor) => {
    setSelectedMonitor(mon.id);
    setCaptureMode("fullscreen");
  };

  const handleSave = () => {
    const finalMode =
      activeTab === "region"
        ? "region"
        : activeTab === "screens"
        ? "fullscreen"
        : "window";

    BotManager.updateRunningConfig(currentBotId, {
      capture_mode: finalMode,
      window_title: selectedWindowTitle || "Roblox",
      monitor_index: selectedMonitor,
      region:
        finalMode === "region"
          ? [coords.x, coords.y, coords.width, coords.height]
          : null,
    });
    setScreenSelectorOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-theme-surface border border-theme-border/80 shadow-2xl flex flex-col">
        {/* Header (Discord Style) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border/60 bg-theme-surface-card/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/15 text-pink-500 flex items-center justify-center shadow-inner">
              <Tv size={20} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-black text-theme-text flex items-center gap-2">
                <span>O que você quer que o bot enxergue?</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-500 font-extrabold uppercase tracking-wide">
                  Estilo Discord
                </span>
              </h3>
              <span className="text-xs text-theme-text-muted">
                Selecione a janela do jogo ou a sua tela para a visão computacional
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshTargets}
              disabled={isLoading}
              className="p-2 rounded-xl hover:bg-theme-surface text-theme-text-muted hover:text-theme-text transition-colors"
              title="Atualizar janelas e monitores abertos"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin text-pink-500" : ""} />
            </button>
            <button
              onClick={() => setScreenSelectorOpen(false)}
              className="p-2 rounded-xl hover:bg-theme-surface text-theme-text-muted hover:text-theme-text transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Discord Tabs: "Janelas de Aplicativos" vs "Telas" vs "Área Customizada" */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-theme-border/40 bg-theme-surface">
          <button
            type="button"
            onClick={() => setActiveTab("windows")}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-black border-b-2 transition-all ${
              activeTab === "windows"
                ? "border-pink-500 text-pink-500"
                : "border-transparent text-theme-text-muted hover:text-theme-text"
            }`}
          >
            <AppWindow size={15} />
            <span>Janelas de Jogos & Apps</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-theme-surface-card border border-theme-border/60">
              {scannedWindows.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("screens")}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-black border-b-2 transition-all ${
              activeTab === "screens"
                ? "border-pink-500 text-pink-500"
                : "border-transparent text-theme-text-muted hover:text-theme-text"
            }`}
          >
            <Monitor size={15} />
            <span>Telas Inteiras</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-theme-surface-card border border-theme-border/60">
              {scannedMonitors.length} {scannedMonitors.length === 1 ? "Monitor" : "Monitores"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("region")}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-black border-b-2 transition-all ${
              activeTab === "region"
                ? "border-pink-500 text-pink-500"
                : "border-transparent text-theme-text-muted hover:text-theme-text"
            }`}
          >
            <Crop size={15} />
            <span>Área Personalizada</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[55vh] flex flex-col gap-4">
          {/* TAB 1: JANELAS DE APLICATIVOS (DISCORD STYLE) */}
          {activeTab === "windows" && (
            <div className="flex flex-col gap-3">
              {/* Highlight especial para o Roblox se estiver aberto */}
              {scannedWindows.filter((w) => w.is_roblox).map((win) => {
                const isSelected =
                  captureMode === "window" && selectedWindowTitle.toLowerCase().includes("roblox");
                return (
                  <div
                    key={win.hwnd}
                    onClick={() => handleSelectWindow(win)}
                    className={`relative p-4 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between overflow-hidden group ${
                      isSelected
                        ? "bg-pink-500/15 border-pink-500 shadow-lg shadow-pink-500/10 ring-2 ring-pink-500/30"
                        : "bg-gradient-to-r from-pink-500/5 to-purple-500/5 border-pink-500/40 hover:border-pink-500"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-pink-500 text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform">
                        🎮
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-theme-text">
                            {win.title}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Jogo Roblox Aberto & Detectado
                          </span>
                        </div>
                        <span className="text-[11px] text-theme-text-muted">
                          Resolução: {win.width} x {win.height} px • Captura de alta fidelidade direta
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-500 text-white font-bold text-xs shadow">
                          <Check size={14} />
                          <span>Selecionado</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-xl bg-theme-surface border border-theme-border text-xs font-bold text-theme-text group-hover:border-pink-500"
                        >
                          Escolher Janela
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Grid com as demais janelas abertas */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-[11px] font-bold text-theme-text-muted uppercase tracking-wider">
                  Outras Janelas Abertas no Windows ({scannedWindows.filter((w) => !w.is_roblox).length})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {scannedWindows
                    .filter((w) => !w.is_roblox)
                    .map((win) => {
                      const isSelected =
                        captureMode === "window" &&
                        selectedWindowTitle === win.title;
                      return (
                        <button
                          key={win.hwnd}
                          type="button"
                          onClick={() => handleSelectWindow(win)}
                          className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                            isSelected
                              ? "bg-theme-primary/10 border-theme-primary text-theme-text shadow-sm"
                              : "bg-theme-surface-card border-theme-border/60 text-theme-text-muted hover:border-theme-border hover:text-theme-text"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-theme-surface border border-theme-border flex items-center justify-center text-sm">
                            🪟
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-bold text-xs text-theme-text truncate">
                              {win.title}
                            </span>
                            <span className="text-[10px] text-theme-text-muted">
                              {win.width} x {win.height} px
                            </span>
                          </div>
                          {isSelected && (
                            <Check size={14} className="text-theme-primary flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TELAS / MONITORES REAIS DETECTADOS */}
          {activeTab === "screens" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-theme-text-muted">
                  {scannedMonitors.length === 1
                    ? "Você possui 1 monitor conectado. Monitores adicionais aparecerão automaticamente caso plugados."
                    : `${scannedMonitors.length} monitores conectados detectados no sistema:`}
                </span>
              </div>

              {/* Exibe APENAS os monitores reais (se tiver 1, mostra só 1!) */}
              <div className={`grid gap-3 ${scannedMonitors.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {scannedMonitors.map((mon) => {
                  const isSelected =
                    captureMode === "fullscreen" && selectedMonitor === mon.id;
                  return (
                    <div
                      key={mon.id}
                      onClick={() => handleSelectMonitor(mon)}
                      className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-3 group ${
                        isSelected
                          ? "bg-theme-primary/10 border-theme-primary shadow-lg ring-2 ring-theme-primary/20"
                          : "bg-theme-surface-card border-theme-border/60 hover:border-theme-border"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl">
                            <Monitor size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-sm text-theme-text">
                              {mon.name}
                            </span>
                            <span className="text-[11px] text-theme-text-muted">
                              Resolução: {mon.width} x {mon.height} px
                            </span>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="px-3 py-1 rounded-xl bg-theme-primary text-white font-bold text-xs flex items-center gap-1 shadow">
                            <Check size={13} />
                            <span>Ativo</span>
                          </div>
                        ) : (
                          <span className="text-xs text-theme-text-muted group-hover:text-theme-text">
                            Selecionar
                          </span>
                        )}
                      </div>

                      {/* Mockup visual da tela do monitor */}
                      <div className="w-full h-24 rounded-2xl bg-black/60 border border-theme-border/40 flex items-center justify-center text-theme-text-muted text-xs font-mono">
                        {mon.width} x {mon.height}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ÁREA PERSONALIZADA */}
          {activeTab === "region" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-theme-text-muted">
                <span>Arraste com o mouse abaixo para definir a região exata:</span>
                <span className="font-mono text-pink-500 font-bold bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/20">
                  X: {coords.x} | Y: {coords.y} | L: {coords.width} | A: {coords.height}
                </span>
              </div>

              <div
                ref={previewBoxRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="relative w-full h-56 rounded-2xl bg-black/90 border border-theme-border/80 cursor-crosshair overflow-hidden flex items-center justify-center select-none shadow-inner"
              >
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                <div
                  style={{
                    left: coords.x,
                    top: coords.y,
                    width: coords.width,
                    height: coords.height,
                  }}
                  className="absolute border-2 border-pink-500 bg-pink-500/25 rounded-lg pointer-events-none flex items-center justify-center shadow-lg"
                >
                  <span className="text-[10px] font-mono font-bold text-white bg-pink-600 px-2 py-0.5 rounded-md shadow">
                    {coords.width}x{coords.height}
                  </span>
                </div>

                {!isDrawing && coords.width <= 20 && (
                  <span className="text-xs text-gray-400 pointer-events-none">
                    Clique e arraste aqui para desenhar o retângulo de captura
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-theme-border/60 bg-theme-surface-card/40">
          <div className="flex items-center gap-2 text-xs text-theme-text-muted">
            <span>Alvo selecionado:</span>
            <span className="font-bold text-theme-text">
              {activeTab === "windows"
                ? `🪟 ${selectedWindowTitle || "Janela do Roblox"}`
                : activeTab === "screens"
                ? `🖥️ Monitor ${selectedMonitor + 1}`
                : `📐 Região (${coords.width}x${coords.height})`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setScreenSelectorOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-theme-text-muted hover:bg-theme-surface transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-2xl bg-theme-primary hover:bg-theme-primary/90 text-xs font-bold text-white shadow-soft transition-transform active:scale-95"
            >
              Salvar & Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
