import React, { useEffect, useState } from "react";
import { useWindowsStore } from "./store/windowsStore";
import { CustomizationCategory } from "./types";
import {
  Sparkles,
  Palette,
  Compass,
  Layout,
  Folder,
  Image,
  Film,
  LayoutGrid,
  MousePointer,
  Volume2,
  Package,
  History,
  Wrench,
  Undo2,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

import { QuickCustomizeView } from "./views/QuickCustomizeView";
import { AppearanceView } from "./views/AppearanceView";
import { StartMenuView } from "./views/StartMenuView";
import { TaskbarView } from "./views/TaskbarView";
import { ExplorerView } from "./views/ExplorerView";
import { FolderStudioView } from "./views/FolderStudioView";
import { WallpaperStudioView } from "./views/WallpaperStudioView";
import { LiveWallpaperView } from "./views/LiveWallpaperView";
import { WidgetsStudioView } from "./views/WidgetsStudioView";
import { CursorStudioView } from "./views/CursorStudioView";
import { SoundStudioView } from "./views/SoundStudioView";
import { AssetLibraryView } from "./views/AssetLibraryView";
import { BackupCenterView } from "./views/BackupCenterView";
import { AdvancedStudioView } from "./views/AdvancedStudioView";

export const WindowsApp: React.FC = () => {
  const {
    activeCategory,
    setActiveCategory,
    osInfo,
    fetchOsInfo,
    changeHistoryCount,
    undoLastChange,
    restoreAllToDefaults,
    notificationMessage,
  } = useWindowsStore();

  useEffect(() => {
    fetchOsInfo();
  }, [fetchOsInfo]);

  const navTabs: { id: CustomizationCategory; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "quick", label: "Estilos Rápidos", icon: <Sparkles size={15} />, badge: "1-Clique" },
    { id: "appearance", label: "Aparência", icon: <Palette size={15} /> },
    { id: "start_menu", label: "Menu Iniciar", icon: <Compass size={15} /> },
    { id: "taskbar", label: "Barra de Tarefas", icon: <Layout size={15} /> },
    { id: "explorer", label: "Explorer", icon: <Folder size={15} /> },
    { id: "folders", label: "Pastas", icon: <Folder size={15} /> },
    { id: "wallpapers", label: "Wallpapers", icon: <Image size={15} /> },
    { id: "live_wallpapers", label: "Live Wallpapers", icon: <Film size={15} /> },
    { id: "widgets", label: "Widgets", icon: <LayoutGrid size={15} /> },
    { id: "cursors", label: "Cursores", icon: <MousePointer size={15} /> },
    { id: "sounds", label: "Sons", icon: <Volume2 size={15} /> },
    { id: "assets", label: "Asset Library", icon: <Package size={15} /> },
    {
      id: "backup",
      label: "Desfazer & Backup",
      icon: <History size={15} />,
      badge: changeHistoryCount > 0 ? String(changeHistoryCount) : undefined,
    },
    { id: "advanced", label: "Avançado", icon: <Wrench size={15} /> },
  ];

  const renderActiveView = () => {
    switch (activeCategory) {
      case "quick":
        return <QuickCustomizeView />;
      case "appearance":
        return <AppearanceView />;
      case "start_menu":
        return <StartMenuView />;
      case "taskbar":
        return <TaskbarView />;
      case "explorer":
        return <ExplorerView />;
      case "folders":
        return <FolderStudioView />;
      case "wallpapers":
        return <WallpaperStudioView />;
      case "live_wallpapers":
        return <LiveWallpaperView />;
      case "widgets":
        return <WidgetsStudioView />;
      case "cursors":
        return <CursorStudioView />;
      case "sounds":
        return <SoundStudioView />;
      case "assets":
        return <AssetLibraryView />;
      case "backup":
        return <BackupCenterView />;
      case "advanced":
        return <AdvancedStudioView />;
      default:
        return <QuickCustomizeView />;
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-theme-bg p-6 space-y-6">
      {/* Toast de Notificação */}
      {notificationMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-semibold shadow-2xl border border-pink-500/40 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>{notificationMessage}</span>
        </div>
      )}

      {/* Top Header com Botão Universal de Desfazer e Modo de Emergência */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-theme-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🪟</span>
            <h1 className="text-lg font-extrabold text-theme-text tracking-tight">
              Windows Customization Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-500/15 text-pink-500 border border-pink-500/30">
              Pedi para meu marido 💕
            </span>
          </div>
          <p className="text-xs text-theme-text-muted mt-1">
            Personalização completa do Windows 10 e 11 com botão de desfazer universal e zero modificação arriscada.
          </p>
        </div>

        {/* Botão Universal Desfazer e Status */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => undoLastChange()}
            disabled={changeHistoryCount === 0}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
              changeHistoryCount > 0
                ? "bg-pink-500 text-white shadow-soft hover:opacity-95"
                : "bg-theme-surface-card text-theme-text-muted border border-theme-border opacity-60 cursor-not-allowed"
            }`}
            title="Desfazer a última personalização aplicada"
          >
            <Undo2 size={14} />
            <span>Desfazer Última Ação</span>
            {changeHistoryCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {changeHistoryCount}
              </span>
            )}
          </button>

          <button
            onClick={restoreAllToDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all active:scale-95"
            title="Restaura tudo aos padrões do Windows em caso de qualquer dúvida"
          >
            <RotateCcw size={13} />
            <span>Emergency Recovery</span>
          </button>
        </div>
      </div>

      {/* Barra de Submenus e Abas Horizontais */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-theme-border">
        {navTabs.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                isActive
                  ? "bg-theme-primary text-white shadow-soft"
                  : "bg-theme-surface hover:bg-theme-surface-card text-theme-text-muted hover:text-theme-text border border-theme-border/50"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? "bg-white/25 text-white" : "bg-pink-500/20 text-pink-400"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo Dinâmico da Aba Selecionada */}
      <div className="flex-1">
        {renderActiveView()}
      </div>
    </div>
  );
};
