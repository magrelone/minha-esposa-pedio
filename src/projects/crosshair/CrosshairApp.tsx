import React, { useState, useEffect } from "react";
import { useCrosshairStore } from "./store/crosshairStore";
import { ClassicEditor } from "./components/ClassicEditor";
import { LayeredEditor } from "./components/LayeredEditor";
import { EmojiPicker } from "./components/EmojiPicker";
import { IconPicker } from "./components/IconPicker";
import { ImageUploader } from "./components/ImageUploader";
import { PreviewArena } from "./components/PreviewArena";
import { CrosshairGallery } from "./components/CrosshairGallery";
import { CS2ImporterModal } from "./components/CS2ImporterModal";
import { ExportModal } from "./components/ExportModal";
import { Button } from "@/core/components/Button";
import { useToast } from "@/core/components/Toast";
import {
  Sliders,
  Layers,
  Smile,
  Target,
  Image as ImageIcon,
  FolderOpen,
  Undo2,
  Redo2,
  Heart,
  Save,
  Crosshair,
  Keyboard,
  Copy,
  Edit2,
  Sparkles,
} from "lucide-react";
import { CrosshairShortcutsModal } from "./components/CrosshairShortcutsModal";
import { CrosshairShortcutsPanel } from "./components/CrosshairShortcutsPanel";
import { CrosshairEffectsTab } from "./components/CrosshairEffectsTab";

type EditorTab = "classic" | "layers" | "effects" | "emojis" | "icons" | "upload" | "gallery" | "shortcuts";


export const CrosshairApp: React.FC = () => {
  const {
    activeCrosshair,
    updateActiveCrosshair,
    setActiveCrosshair,
    undo,
    redo,
    undoStack,
    redoStack,
    saveCurrentCrosshair,
    toggleFavorite,
    favorites,
  } = useCrosshairStore();

  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<EditorTab>("layers");

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(activeCrosshair.name);

  const isFav = favorites.includes(activeCrosshair.id);

  const handleDuplicateCrosshair = () => {
    const clone = {
      ...JSON.parse(JSON.stringify(activeCrosshair)),
      id: `custom-${Date.now()}`,
      name: `${activeCrosshair.name} (Modificada)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setActiveCrosshair(clone);
    saveCurrentCrosshair();
    addToast(`Cópia criada: "${clone.name}" pronta para modificar! ✨`, "sparkle");
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      updateActiveCrosshair((prev) => ({ ...prev, name: nameInput.trim() }));
      addToast("Nome da mira atualizado! 💕", "love");
    }
    setIsEditingName(false);
  };


  // Global Undo/Redo & Save Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveCurrentCrosshair();
        addToast("Salvo com sucesso 💗", "love");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, saveCurrentCrosshair, addToast]);

  const handleSave = () => {
    saveCurrentCrosshair();
    addToast("Salvo com carinho 💕", "love");
  };



  return (
    <div className="flex flex-col h-full gap-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-theme-surface p-4 rounded-cuter border border-theme-border/60 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-theme-primary/10 text-theme-primary flex items-center justify-center flex-shrink-0">
            <Crosshair size={22} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") setIsEditingName(false);
                    }}
                    autoFocus
                    className="text-sm font-bold bg-theme-surface border border-theme-primary px-2 py-0.5 rounded-lg text-theme-text"
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-2 py-0.5 rounded bg-theme-primary text-white text-xs font-bold"
                  >
                    Salvar
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center gap-1.5 group cursor-pointer"
                  title="Clique para renomear esta mira"
                  onClick={() => {
                    setNameInput(activeCrosshair.name);
                    setIsEditingName(true);
                  }}
                >
                  <h2 className="text-base font-bold text-theme-text group-hover:text-theme-primary transition-colors">
                    {activeCrosshair.name}
                  </h2>
                  <Edit2 size={13} className="text-theme-text-muted group-hover:text-theme-primary opacity-60 transition-all" />
                </div>
              )}
              <button
                onClick={() => toggleFavorite(activeCrosshair.id)}
                className={`transition-colors p-1 rounded-full ${
                  isFav ? "text-pink-500 fill-pink-500" : "text-theme-text-muted hover:text-pink-500"
                }`}
              >
                <Heart size={16} className={isFav ? "fill-pink-500" : ""} />
              </button>
            </div>
            <span className="text-xs text-theme-text-muted">
              {activeCrosshair.description || "Clique no nome para renomear ou personalize cada camada ✨"}
            </span>
          </div>
        </div>

        {/* Action, Duplicate, Shortcuts & Save Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {/* Botão de Atalhos do Crosshair */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-theme-surface-card border border-theme-border/80 hover:border-theme-primary text-theme-text text-xs font-bold transition-all shadow-sm"
            title="Configurar tecla de atalho para ligar/desligar a mira no jogo"
          >
            <Keyboard size={15} className="text-theme-primary" />
            <span>Atalhos (F10)</span>
          </button>

          {/* Botão de Duplicar / Clonar Mira */}
          <button
            onClick={handleDuplicateCrosshair}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-theme-surface-card border border-theme-border/80 hover:border-theme-primary text-theme-text text-xs font-bold transition-all shadow-sm"
            title="Criar uma cópia desta mira para fazer modificações"
          >
            <Copy size={14} className="text-theme-secondary" />
            <span>Duplicar Mira</span>
          </button>

          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="p-2 rounded-xl bg-theme-surface-card border border-theme-border/60 text-theme-text-muted hover:text-theme-text disabled:opacity-30 transition-all"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-2 rounded-xl bg-theme-surface-card border border-theme-border/60 text-theme-text-muted hover:text-theme-text disabled:opacity-30 transition-all"
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
          <Button
            variant="primary"
            size="sm"
            icon={<Save size={15} />}
            onClick={handleSave}
          >
            Salvar 💗
          </Button>
        </div>
      </div>

      {/* Editor Tabs Navigation */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: "layers", label: "Camadas & Formas 💕", icon: <Layers size={14} /> },
          { id: "effects", label: "Efeitos & Glow 🌈✨", icon: <Sparkles size={14} /> },
          { id: "emojis", label: "Emojis Fofos 😍", icon: <Smile size={14} /> },
          { id: "icons", label: "Ícones & Símbolos 🎯", icon: <Target size={14} /> },
          { id: "classic", label: "Mira Clássica / Linhas 🎯", icon: <Sliders size={14} /> },
          { id: "upload", label: "Enviar Imagem 🖼️", icon: <ImageIcon size={14} /> },
          { id: "gallery", label: "Galeria de Miras 📚", icon: <FolderOpen size={14} /> },
          { id: "shortcuts", label: "Atalhos do Teclado ⌨️", icon: <Keyboard size={14} /> },
        ].map((tab) => (

          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as EditorTab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-cute border transition-all ${
              activeTab === tab.id
                ? "bg-theme-surface border-theme-primary text-theme-primary font-semibold shadow-soft"
                : "bg-theme-surface/50 border-theme-border/40 text-theme-text-muted hover:text-theme-text hover:bg-theme-surface"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Workspace: 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Control Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-theme-surface rounded-cuter border border-theme-border/60 shadow-soft p-5 overflow-y-auto max-h-[640px]">
          {activeTab === "classic" && (
            <ClassicEditor onSwitchTab={(tab) => setActiveTab(tab as EditorTab)} />
          )}
          {activeTab === "layers" && <LayeredEditor />}
          {activeTab === "effects" && <CrosshairEffectsTab />}
          {activeTab === "emojis" && <EmojiPicker />}
          {activeTab === "icons" && <IconPicker />}
          {activeTab === "upload" && <ImageUploader />}
          {activeTab === "shortcuts" && <CrosshairShortcutsPanel />}

          {activeTab === "gallery" && (
            <CrosshairGallery
              onSelect={() => {
                // Auto switch to appropriate editor
                const nextType = useCrosshairStore.getState().activeCrosshair.type;
                setActiveTab(nextType === "classic" ? "classic" : "layers");
              }}
              onOpenImport={() => setIsImportOpen(true)}
              onOpenExport={() => setIsExportOpen(true)}
            />
          )}
        </div>

        {/* Right Preview Viewport (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <PreviewArena />
        </div>
      </div>

      {/* Modals */}
      <CrosshairShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
      <CS2ImporterModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

    </div>
  );
};

export default CrosshairApp;
