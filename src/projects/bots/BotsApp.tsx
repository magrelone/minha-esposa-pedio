import React, { useEffect } from "react";
import {
  Home,
  Bot,
  BookOpen,
  Eye,
  Sliders,
  FileText,
  ShieldAlert,
  Info,
  Layers,
  Sparkles,
  Cpu,
  Gamepad2,
  Radar,
} from "lucide-react";
import { useBotsStore } from "./store/botsStore";
import { BotManager } from "./core/BotManager";
import { BotTab } from "./types";

// Views
import { BotsHomeView } from "./components/BotsHomeView";
import { RobloxView } from "./components/RobloxView";
import { MyBotsView } from "./components/MyBotsView";
import { BotLibraryView } from "./components/BotLibraryView";
import { VisionView } from "./components/VisionView";
import { HolographicMapView } from "./components/HolographicMapView";
import { VisionModelsView } from "./components/VisionModelsView";
import { LogsView } from "./components/LogsView";
import { DiagnosticsView } from "./components/DiagnosticsView";
import { AboutBotsView } from "./components/AboutBotsView";
import { TrainingView } from "./components/TrainingView";
import { DatasetInspectorView } from "./components/DatasetInspectorView";
import { BotCreatorWizard } from "./components/BotCreatorWizard";

// Modals
import { BotConfigModal } from "./components/BotConfigModal";
import { ScreenSelectorModal } from "./components/ScreenSelectorModal";
import { ModelTesterModal } from "./components/ModelTesterModal";

export const BotsApp: React.FC = () => {
  const { activeTab, setActiveTab, activeBotId, botStatus } = useBotsStore();
  const [modelTesterOpen, setModelTesterOpen] = React.useState(false);

  useEffect(() => {
    BotManager.init();
  }, []);

  const isRunning = activeBotId && botStatus[activeBotId] === "running";

  const navigationTabs: { id: BotTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "home", label: "Visão Geral", icon: <Home size={15} /> },
    { id: "roblox", label: "Roblox", icon: <Gamepad2 size={15} />, badge: "MM2" },
    { id: "vision", label: "Visão do Bot", icon: <Eye size={15} /> },
    { id: "mapping", label: "Mapeamento 2D", icon: <Radar size={15} />, badge: "Holo" },
    { id: "my-bots", label: "Meus Bots", icon: <Bot size={15} /> },
    { id: "library", label: "Biblioteca", icon: <BookOpen size={15} /> },
    { id: "wizard", label: "Criar Bot", icon: <Sparkles size={15} />, badge: "Novo" },
    { id: "models", label: "Modelos", icon: <Layers size={15} /> },
    { id: "training", label: "Treinamento", icon: <Cpu size={15} /> },
    { id: "datasets", label: "Datasets", icon: <Sliders size={15} /> },
    { id: "logs", label: "Logs", icon: <FileText size={15} /> },
    { id: "diagnostics", label: "Diagnóstico", icon: <ShieldAlert size={15} /> },
    { id: "about", label: "Sobre & Créditos", icon: <Info size={15} /> },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "home":
        return <BotsHomeView />;
      case "roblox":
        return <RobloxView />;
      case "my-bots":
        return <MyBotsView />;
      case "library":
        return <BotLibraryView />;
      case "wizard":
        return <BotCreatorWizard onComplete={() => setActiveTab("my-bots")} />;
      case "vision":
        return <VisionView />;
      case "mapping":
        return <HolographicMapView />;
      case "models":
        return <VisionModelsView />;
      case "training":
        return <TrainingView />;
      case "datasets":
        return <DatasetInspectorView />;
      case "logs":
        return <LogsView />;
      case "diagnostics":
        return <DiagnosticsView />;
      case "about":
        return <AboutBotsView />;
      default:
        return <BotsHomeView />;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 select-none">
      {/* Top Navigation Tabs Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 scrollbar-none">
          {navigationTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-theme-primary text-white shadow-soft"
                    : "text-theme-text-muted hover:text-theme-text hover:bg-theme-surface-card"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-pink-500/15 text-pink-500"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Running Bot Pill if active */}
        {isRunning && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold mr-2 flex-shrink-0 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Bot em Execução</span>
          </div>
        )}
      </div>

      {/* Main View Area */}
      <div className="min-h-[500px]">{renderActiveTab()}</div>

      {/* Global Modals */}
      <BotConfigModal />
      <ScreenSelectorModal />
    </div>
  );
};
