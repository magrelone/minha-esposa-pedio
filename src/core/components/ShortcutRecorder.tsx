import React, { useState, useEffect, useRef } from "react";
import {
  Keyboard,
  RotateCcw,
  AlertTriangle,
  Check,
  Zap,
  Sparkles,
  Info,
} from "lucide-react";
import { ShortcutDefinition, useShortcutsStore } from "../stores/shortcutsStore";
import { useToast } from "./Toast";

interface ShortcutRecorderProps {
  shortcut: ShortcutDefinition;
  onConflictDetected?: (conflictWith: ShortcutDefinition) => void;
}

export const ShortcutRecorder: React.FC<ShortcutRecorderProps> = ({
  shortcut,
  onConflictDetected,
}) => {
  const { addToast } = useToast();
  const { updateShortcut, resetShortcut, findConflict } = useShortcutsStore();

  const [isRecording, setIsRecording] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);
  const [justTested, setJustTested] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Divide a chave atual em tokens de tecla (ex: "Control+Alt+X" -> ["Ctrl", "Alt", "X"])
  const formatKeyParts = (rawKey: string): string[] => {
    return rawKey.split("+").map((part) => {
      const p = part.trim();
      if (p.toLowerCase() === "control") return "Ctrl";
      if (p.toLowerCase() === "escape") return "ESC";
      return p;
    });
  };

  // Escuta tecla quando em gravação
  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = async (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Teclas modificadoras puras apenas atualizam o display temporário
      const isModifierOnly = [
        "Control",
        "Alt",
        "Shift",
        "Meta",
      ].includes(e.key);

      const parts: string[] = [];
      if (e.ctrlKey) parts.push("Control");
      if (e.altKey) parts.push("Alt");
      if (e.shiftKey) parts.push("Shift");

      if (isModifierOnly) {
        setRecordedKeys(parts);
        return;
      }

      // Tecla final
      let finalKey = e.key;

      // Normalizações convenientes
      if (finalKey.startsWith("F") && finalKey.length <= 3) {
        finalKey = finalKey.toUpperCase();
      } else if (finalKey === " ") {
        finalKey = "Space";
      } else if (finalKey === "ArrowUp") {
        finalKey = "Up";
      } else if (finalKey === "ArrowDown") {
        finalKey = "Down";
      } else if (finalKey === "ArrowLeft") {
        finalKey = "Left";
      } else if (finalKey === "ArrowRight") {
        finalKey = "Right";
      } else if (finalKey.length === 1) {
        finalKey = finalKey.toUpperCase();
      }

      // Adiciona na combinação se já não foi modificador
      if (!parts.includes(finalKey)) {
        parts.push(finalKey);
      }

      const combinedString = parts.join("+");

      // Validar tecla ESC isolada
      if (
        combinedString.toUpperCase() === "ESC" ||
        combinedString.toUpperCase() === "ESCAPE"
      ) {
        setWarningMessage(
          "ESC isolado não pode ser usado para não bloquear jogos. Use Shift+ESC!"
        );
        addToast(
          "A tecla ESC isolada trava os menus nos jogos! Use Shift+ESC.",
          "warning"
        );
        setIsRecording(false);
        setRecordedKeys([]);
        return;
      }

      // Validar conflitos
      const conflict = findConflict(combinedString, shortcut.id);
      if (conflict) {
        setWarningMessage(
          `Conflito: já está em uso por "${conflict.label}"!`
        );
        if (onConflictDetected) onConflictDetected(conflict);
      } else {
        setWarningMessage(null);
      }

      // Salvar
      const res = await updateShortcut(shortcut.id, combinedString);
      if (res.success) {
        addToast(`Atalho atualizado para ${combinedString}! ✨`, "sparkle");
      } else {
        addToast(res.message || "Não foi possível usar essa combinação.", "warning");
      }

      setIsRecording(false);
      setRecordedKeys([]);
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [isRecording, shortcut.id, updateShortcut, findConflict, onConflictDetected, addToast]);

  // Listener para "Testar Atalho" em tempo real
  useEffect(() => {
    const handleTestKey = (e: KeyboardEvent) => {
      if (isRecording) return;

      const currentParts = shortcut.currentKey.split("+").map((p) => p.toUpperCase());
      const hasCtrl = currentParts.includes("CONTROL") || currentParts.includes("CTRL");
      const hasAlt = currentParts.includes("ALT");
      const hasShift = currentParts.includes("SHIFT");

      const baseKey = currentParts.find(
        (p) => !["CONTROL", "CTRL", "ALT", "SHIFT"].includes(p)
      );

      const ctrlMatch = hasCtrl ? e.ctrlKey : !e.ctrlKey;
      const altMatch = hasAlt ? e.altKey : !e.altKey;
      const shiftMatch = hasShift ? e.shiftKey : !e.shiftKey;

      const keyMatch =
        baseKey &&
        (e.key.toUpperCase() === baseKey ||
          (baseKey === "SPACE" && e.key === " ") ||
          (baseKey === "INSERT" && (e.key === "Insert" || e.code === "Insert")) ||
          (baseKey === "ESCAPE" && e.key === "Escape"));

      if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
        setJustTested(true);
        setTimeout(() => setJustTested(false), 800);
      }
    };

    window.addEventListener("keydown", handleTestKey);
    return () => window.removeEventListener("keydown", handleTestKey);
  }, [shortcut.currentKey, isRecording]);

  const handleReset = async () => {
    await resetShortcut(shortcut.id);
    setWarningMessage(null);
    addToast(`Atalho restaurado para o padrão (${shortcut.defaultKey})`, "info");
  };

  const isCustom = shortcut.currentKey !== shortcut.defaultKey;
  const keyTokens = isRecording && recordedKeys.length > 0
    ? recordedKeys
    : formatKeyParts(shortcut.currentKey);

  return (
    <div
      ref={containerRef}
      className={`p-4 rounded-2xl bg-theme-surface-card border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none ${
        justTested
          ? "border-pink-500 shadow-lg shadow-pink-500/20 bg-pink-500/5 scale-[1.01]"
          : isRecording
          ? "border-purple-500 ring-2 ring-purple-500/30 bg-purple-500/5"
          : "border-theme-border/50 hover:border-theme-border"
      }`}
    >
      {/* Informações da Ação */}
      <div className="flex flex-col gap-1 min-w-0 max-w-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-theme-text truncate">
            {shortcut.label}
          </span>
          {shortcut.isDanger && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/10 text-red-500 border border-red-500/20">
              Pânico
            </span>
          )}
          {shortcut.isGlobal && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-theme-primary/10 text-theme-primary border border-theme-primary/20">
              Global
            </span>
          )}
        </div>
        <p className="text-xs text-theme-text-muted leading-relaxed line-clamp-2">
          {shortcut.description}
        </p>

        {warningMessage && (
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-500 font-medium">
            <AlertTriangle size={12} className="flex-shrink-0" />
            <span>{warningMessage}</span>
          </div>
        )}
      </div>

      {/* Área de Visualização e Botão de Gravação */}
      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
        {/* Visualizador de Teclas (Keycaps) */}
        <div
          onClick={() => setIsRecording(true)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
            isRecording
              ? "bg-purple-600 text-white border-purple-500 animate-pulse shadow-md"
              : justTested
              ? "bg-pink-500 text-white border-pink-400"
              : "bg-theme-surface border-theme-border/70 hover:border-theme-primary/70 shadow-sm"
          }`}
          title="Clique para alterar este atalho"
        >
          {isRecording ? (
            <div className="flex items-center gap-2 text-xs font-bold">
              <Keyboard size={14} className="animate-bounce" />
              <span>Pressione a nova tecla...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {keyTokens.map((token, idx) => (
                <React.Fragment key={idx}>
                  <kbd className="px-2 py-1 text-xs font-mono font-black rounded-lg bg-theme-bg/80 border border-theme-border/60 shadow-inner text-theme-text tracking-wider">
                    {token}
                  </kbd>
                  {idx < keyTokens.length - 1 && (
                    <span className="text-[10px] text-theme-text-muted font-bold">
                      +
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Botão de Alterar / Cancelar Gravação */}
        <button
          onClick={() => {
            if (isRecording) {
              setIsRecording(false);
              setRecordedKeys([]);
            } else {
              setIsRecording(true);
            }
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            isRecording
              ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
              : "bg-theme-surface hover:bg-theme-surface-card text-theme-text border border-theme-border/60"
          }`}
        >
          {isRecording ? "Cancelar" : "Alterar"}
        </button>

        {/* Botão de Restaurar Padrão */}
        {isCustom && (
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-theme-surface hover:bg-theme-surface-card text-theme-text-muted hover:text-theme-text border border-theme-border/60 transition-all"
            title={`Restaurar atalho padrão (${shortcut.defaultKey})`}
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
