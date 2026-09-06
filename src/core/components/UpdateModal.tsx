import React, { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import {
  UpdateInfo,
  installUpdate,
  openInBrowser,
  dismissUpdate,
  UpdateProgress,
} from "../services/updateService";
import { Heart, Sparkles, Download, ExternalLink, X, CheckCircle2, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
  currentVersion: string;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
  currentVersion,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<UpdateProgress>({
    status: "idle",
    percent: 0,
    message: "",
  });

  // Dispara confetes fofos de corações quando o modal abre
  useEffect(() => {
    if (isOpen && updateInfo) {
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#ec4899", "#f43f5e", "#a855f7", "#fb7185"],
        });
      } catch {}
    }
  }, [isOpen, updateInfo]);

  // Escuta eventos de progresso de download emitidos pelo Rust
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    listen<UpdateProgress>("update-download-progress", (event) => {
      setProgress(event.payload);
      if (event.payload.status === "error") {
        setDownloading(false);
      }
    })
      .then((fn) => {
        unlisten = fn;
      })
      .catch(() => {});

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  if (!isOpen || !updateInfo) return null;

  const handleInstall = async () => {
    setDownloading(true);
    setProgress({
      status: "downloading",
      percent: 20,
      message: "Preparando download com todo carinho... 💕",
    });

    try {
      await installUpdate(updateInfo.url);
    } catch (err: any) {
      setProgress({
        status: "error",
        percent: 0,
        message: "Ops amor, deu um errinho. Pode baixar pelo navegador! 💕",
      });
      setDownloading(false);
    }
  };

  const handleDismiss = () => {
    dismissUpdate(updateInfo.version);
    onClose();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-theme-surface-card border-2 border-pink-500/30 shadow-2xl shadow-pink-500/20 text-theme-text transition-all scale-100">
        {/* Banner de Cabeçalho Fofinho */}
        <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 p-6 text-white text-center">
          {/* Decorações sutis de fundo */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

          {/* Botão de Fechar */}
          <button
            onClick={onClose}
            disabled={downloading}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors disabled:opacity-50"
            title="Fechar"
          >
            <X size={18} />
          </button>

          {/* Ícone flutuante animado */}
          <div className="inline-flex items-center justify-center w-16 h-16 mb-2 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner text-3xl animate-bounce">
            💌
          </div>

          <h2 className="text-xl font-extrabold tracking-tight drop-shadow-sm flex items-center justify-center gap-2">
            <span>Amor, saiu updatezinho! ehehehe</span>
            <span className="text-pink-200">💕</span>
          </h2>
          <p className="text-xs text-pink-100/90 mt-1 font-medium">
            O maridão preparou uma versão quentinha cheia de carinho pra você! ✨
          </p>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 flex flex-col gap-4">
          {/* Comparativo de Versão */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/40 text-xs">
            <div className="flex flex-col">
              <span className="text-theme-text-muted text-[10px] uppercase font-bold tracking-wider">
                Sua Versão Atual
              </span>
              <span className="font-semibold text-theme-text">v{currentVersion}</span>
            </div>

            <div className="flex items-center gap-1.5 text-pink-500 font-bold px-2 py-1 rounded-full bg-pink-100 dark:bg-pink-900/50">
              <Sparkles size={14} />
              <span>Nova: v{updateInfo.version}</span>
            </div>
          </div>

          {/* Novidades / Changelog */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-theme-text flex items-center gap-1.5">
                <Heart size={14} className="text-pink-500 fill-pink-500" />
                O que há de novo para você:
              </span>
              {formatFileSize(updateInfo.size) && (
                <span className="text-[10px] text-theme-text-muted font-mono">
                  Tamanho: {formatFileSize(updateInfo.size)}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-theme-surface border border-theme-border/60 max-h-36 overflow-y-auto text-xs text-theme-text-muted leading-relaxed whitespace-pre-wrap selection:bg-pink-500/20">
              {updateInfo.notes}
            </div>
          </div>

          {/* Barra de Progresso durante o Download */}
          {downloading && (
            <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/50 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                  <Sparkles size={14} className="animate-spin text-pink-500" />
                  {progress.message || "Baixando com carinho..."}
                </span>
                <span className="font-bold text-pink-600 dark:text-pink-400 font-mono">
                  {Math.round(progress.percent)}%
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-pink-200/50 dark:bg-pink-950 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(5, progress.percent)}%` }}
                />
              </div>
            </div>
          )}

          {/* Mensagem de Erro se houver */}
          {progress.status === "error" && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-500 flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{progress.message}</span>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button
              onClick={handleInstall}
              disabled={downloading}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download size={16} />
              <span>{downloading ? "Atualizando..." : "Instalar com Amor 💕"}</span>
            </button>

            <button
              onClick={() => openInBrowser(updateInfo.url)}
              disabled={downloading}
              className="w-full sm:w-auto py-3 px-3.5 rounded-2xl bg-theme-surface hover:bg-theme-border/30 border border-theme-border text-xs text-theme-text font-medium transition-colors flex items-center justify-center gap-1.5"
              title="Baixar diretamente pelo navegador"
            >
              <ExternalLink size={14} className="text-theme-text-muted" />
              <span>Navegador</span>
            </button>

            <button
              onClick={handleDismiss}
              disabled={downloading}
              className="w-full sm:w-auto py-3 px-3 rounded-2xl hover:bg-theme-border/20 text-xs text-theme-text-muted hover:text-theme-text transition-colors"
            >
              Depois meu bem 💖
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
