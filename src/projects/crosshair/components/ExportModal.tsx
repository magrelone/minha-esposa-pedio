import React, { useState } from "react";
import { Modal } from "@/core/components/Modal";
import { Button } from "@/core/components/Button";
import { useCrosshairStore } from "../store/crosshairStore";
import { CrosshairRenderer } from "../engine/renderer";
import { CS2Parser } from "../engine/cs2-parser";
import { useToast } from "@/core/components/Toast";
import { Download, Copy, FileCode, Check } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { activeCrosshair } = useCrosshairStore();
  const { addToast } = useToast();
  const [copiedCs2, setCopiedCs2] = useState(false);

  const handleExportJson = () => {
    const exportData = {
      format: "pedi-para-meu-marido-crosshair",
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      crosshair: activeCrosshair,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeCrosshair.name.toLowerCase().replace(/\s+/g, "-")}.crosshair`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Arquivo .crosshair exportado com sucesso! ✨", "sparkle");
    onClose();
  };

  const handleExportPng = () => {
    const dataUrl = CrosshairRenderer.toPngDataUrl(activeCrosshair, 512);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${activeCrosshair.name.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
    addToast("Imagem PNG transparente salva com sucesso! 💗", "love");
    onClose();
  };

  const handleCopyCs2 = () => {
    if (activeCrosshair.classicConfig) {
      const cmds = CS2Parser.toCommands(activeCrosshair.classicConfig);
      navigator.clipboard.writeText(cmds);
      setCopiedCs2(true);
      addToast("Comandos do CS2 copiados para a área de transferência! 🎯", "success");
      setTimeout(() => setCopiedCs2(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Exportar Mira: ${activeCrosshair.name}`}
      maxWidth="md"
    >
      <div className="flex flex-col gap-4">
        <p className="text-xs text-theme-text-muted">
          Escolha o formato que deseja para salvar ou compartilhar sua mira:
        </p>

        <div className="grid grid-cols-1 gap-3">
          {/* Opção 1: Arquivo .crosshair */}
          <div className="p-4 bg-theme-surface-card rounded-cute border border-theme-border/60 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-theme-text flex items-center gap-1.5">
                <FileCode size={16} className="text-theme-primary" />
                Arquivo de Projeto (.crosshair)
              </span>
              <span className="text-xs text-theme-text-muted">
                Exporta toda a estrutura de camadas e configurações em JSON versionado.
              </span>
            </div>
            <Button size="sm" variant="secondary" onClick={handleExportJson}>
              Baixar
            </Button>
          </div>

          {/* Opção 2: Imagem PNG transparente */}
          <div className="p-4 bg-theme-surface-card rounded-cute border border-theme-border/60 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-theme-text flex items-center gap-1.5">
                <Download size={16} className="text-pink-500" />
                Imagem PNG Transparente (512x512)
              </span>
              <span className="text-xs text-theme-text-muted">
                Perfeita para usar como asset, avatar ou sticker.
              </span>
            </div>
            <Button size="sm" variant="secondary" onClick={handleExportPng}>
              Baixar
            </Button>
          </div>

          {/* Opção 3: Comandos de CS2 */}
          {activeCrosshair.classicConfig && (
            <div className="p-4 bg-theme-surface-card rounded-cute border border-theme-border/60 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-theme-text flex items-center gap-1.5">
                  <Copy size={16} className="text-emerald-500" />
                  Comandos de Console CS2
                </span>
                <span className="text-xs text-theme-text-muted">
                  Copia a linha de comando cl_crosshair para colar no console do jogo.
                </span>
              </div>
              <Button size="sm" variant="secondary" onClick={handleCopyCs2}>
                {copiedCs2 ? <Check size={14} className="text-emerald-500" /> : "Copiar"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
