import React, { useState } from "react";
import { Modal } from "@/core/components/Modal";
import { Button } from "@/core/components/Button";
import { CS2Parser } from "../engine/cs2-parser";
import { useCrosshairStore } from "../store/crosshairStore";
import { useToast } from "@/core/components/Toast";
import { Terminal, CheckCircle2, AlertCircle } from "lucide-react";

interface CS2ImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CS2ImporterModal: React.FC<CS2ImporterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { setActiveCrosshair, updateActiveCrosshair } = useCrosshairStore();
  const { addToast } = useToast();
  const [inputCode, setInputCode] = useState("");
  const [previewCommands, setPreviewCommands] = useState<string | null>(null);

  const handleImport = () => {
    if (!inputCode.trim()) return;

    try {
      const parsed = CS2Parser.parse(inputCode);
      const classicLayer = CS2Parser.toClassicLayer(parsed);

      const newItem = {
        id: `cs2-${Date.now()}`,
        name: "Mira Importada do CS2",
        description: "Configuração importada de comandos de console do Counter-Strike 2",
        category: "CS2" as const,
        tags: ["cs2", "importada", "competitivo"],
        type: "classic" as const,
        author: "Jogador CS2",
        favorite: false,
        usageCount: 1,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        layers: [],
        classicConfig: classicLayer,
        cs2Commands: inputCode,
      };

      setActiveCrosshair(newItem);
      addToast("Mira do CS2 importada com sucesso! 🎯", "success");
      onClose();
    } catch (err: any) {
      addToast("Não foi possível decodificar os comandos do CS2.", "warning");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar Configuração do Counter-Strike 2"
      maxWidth="lg"
    >
      <div className="flex flex-col gap-4">
        <p className="text-xs text-theme-text-muted">
          Cole abaixo as linhas de comando do console do CS2 contendo instruções{" "}
          <code className="bg-theme-surface-card px-1.5 py-0.5 rounded text-theme-primary font-mono text-[11px]">
            cl_crosshair*
          </code>
          . O parser identificará automaticamente as cores, tamanho, gap, espessura e outline.
        </p>

        <div className="relative">
          <textarea
            rows={6}
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder={`cl_crosshairsize 2.5;\ncl_crosshairgap -1.5;\ncl_crosshairthickness 1;\ncl_crosshaircolor 5;\ncl_crosshaircolor_r 255;\ncl_crosshaircolor_g 105;\ncl_crosshaircolor_b 180;\ncl_crosshairalpha 255;\ncl_crosshairdot 0;`}
            className="w-full p-3 font-mono text-xs bg-theme-surface-card border border-theme-border rounded-xl text-theme-text focus:outline-none focus:border-theme-primary resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Terminal size={15} />}
            onClick={handleImport}
            disabled={!inputCode.trim()}
          >
            Importar & Aplicar Mira
          </Button>
        </div>
      </div>
    </Modal>
  );
};
