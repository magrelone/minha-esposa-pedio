import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  BotConfig,
  BotLogEntry,
  BotProfile,
  BotStatus,
  BotTab,
  RobloxSubTab,
  VisionDetection,
  VisionModelItem,
  ActiveLearningState,
} from "../types";
import { BOT_REGISTRY } from "../core/BotRegistry";

export interface BotsState {
  activeTab: BotTab;
  robloxSubTab: RobloxSubTab;
  activeBotId: string | null;
  botStatus: Record<string, BotStatus>;
  botConfigs: Record<string, BotConfig>;
  profiles: BotProfile[];
  activeProfileId: string | null;
  favorites: string[];

  // Logs & Live console
  logs: BotLogEntry[];
  logFilter: "all" | "info" | "vision" | "movement" | "warning" | "error";
  logSearch: string;

  // Real-time detection & metrics
  latestDetections: VisionDetection[];
  detectedCoins: number;
  detectedPlayers: number;
  fpsCapture: number;
  fpsInference: number;
  previewImage: string | null;
  uptimeSecs: number;
  lastAction: string | null;
  hardwareDevice: string;

  // Active Continuous Learning (Google Gemini 2.0 Flash)
  activeLearning: ActiveLearningState;
  setActiveLearningEnabled: (enabled: boolean) => void;
  updateActiveLearning: (data: Partial<ActiveLearningState>) => void;

  // Environment & Models
  environmentData: any | null;
  isCheckingEnv: boolean;
  discoveredModels: VisionModelItem[];
  isLoadingModels: boolean;

  // Modals
  configModalBotId: string | null;
  screenSelectorOpen: boolean;

  // Actions
  setActiveTab: (tab: BotTab) => void;
  setRobloxSubTab: (subTab: RobloxSubTab) => void;
  setConfigModalBotId: (id: string | null) => void;
  setScreenSelectorOpen: (open: boolean) => void;
  toggleFavorite: (botId: string) => void;

  setBotStatus: (botId: string, status: BotStatus) => void;
  updateBotConfig: (botId: string, partial: Partial<BotConfig>) => void;
  applyProfile: (profile: BotProfile) => void;
  addProfile: (profile: BotProfile) => void;
  removeProfile: (profileId: string) => void;

  addLog: (level: BotLogEntry["level"], message: string) => void;
  clearLogs: () => void;
  setLogFilter: (filter: BotsState["logFilter"]) => void;
  setLogSearch: (search: string) => void;

  updateRealtimeMetrics: (metrics: {
    detections?: VisionDetection[];
    fpsCapture?: number;
    fpsInference?: number;
    detectedCoins?: number;
    detectedPlayers?: number;
    previewImage?: string | null;
    lastAction?: string;
    device?: string;
  }) => void;

  setEnvironmentData: (data: any) => void;
  setIsCheckingEnv: (loading: boolean) => void;
  setDiscoveredModels: (models: VisionModelItem[]) => void;
  setIsLoadingModels: (loading: boolean) => void;
  setupProgress: import("../types").BotSetupProgress | null;
  setSetupProgress: (progress: import("../types").BotSetupProgress | null) => void;
}

const DEFAULT_PROFILES: BotProfile[] = [
  {
    id: "mm2-normal",
    name: "MM2 — Normal",
    botId: "roblox-mm2-coin-collector",
    description: "Configuração balanceada com desvio de jogadores e coleta de moedas.",
    config: {
      mode: "coin_and_players",
      weights: "integrations/robloxbot/vendor/bots/mm2_yolo_coin_collector/weights/yolo11_roblox_official.pt",
      conf_thres: 0.25,
      simulation_mode: false,
      jump_prob: 0.1,
    },
  },
  {
    id: "mm2-coin-only",
    name: "MM2 — Coin Only",
    botId: "roblox-mm2-coin-collector",
    description: "Foco exclusivo em coletar moedas douradas sem fugir de outros jogadores.",
    config: {
      mode: "coin_only",
      weights: "integrations/robloxbot/vendor/bots/mm2_yolo_coin_collector/weights/yolo11_roblox_official.pt",
      conf_thres: 0.25,
      simulation_mode: false,
      jump_prob: 0.05,
    },
  },
  {
    id: "mm2-safe-simulation",
    name: "MM2 — Simulação Segura",
    botId: "roblox-mm2-coin-collector",
    description: "Detecta e analisa em tempo real sem emitir cliques ou teclas reais no jogo.",
    config: {
      weights: "integrations/robloxbot/vendor/bots/mm2_yolo_coin_collector/weights/yolo11_roblox_official.pt",
      simulation_mode: true,
      send_preview: true,
      conf_thres: 0.2,
    },
  },
  {
    id: "hanami-full-patrol",
    name: "🌸 Hanami — Coleta Completa (Branco + Preto)",
    botId: "roblox-hanami-spirit-collector",
    description: "Patrulha o circuito de Hanami absorvendo tanto espíritos brancos quanto pretos.",
    config: {
      mode: "all_spirits",
      weights: "integrations/robloxbot/vendor/bots/mm2_yolo_coin_collector/weights/yolo11_hanami_spirits.pt",
      conf_thres: 0.28,
      simulation_mode: false,
      jump_prob: 0.05,
      collection_dwell_time: 3.2,
      patrol_when_empty: true,
      approach_timeout_s: 3.5,
    },
  },
  {
    id: "hanami-white-only",
    name: "🤍 Hanami — Apenas Gatos Brancos",
    botId: "roblox-hanami-spirit-collector",
    description: "Foca exclusivamente na absorção dos espíritos brancos e brilhantes de cerejeira.",
    config: {
      mode: "white_only",
      weights: "integrations/robloxbot/vendor/bots/mm2_yolo_coin_collector/weights/yolo11_hanami_spirits.pt",
      conf_thres: 0.28,
      simulation_mode: false,
      jump_prob: 0.05,
      collection_dwell_time: 3.2,
      patrol_when_empty: true,
      approach_timeout_s: 3.5,
    },
  },
  {
    id: "hanami-black-only",
    name: "🖤 Hanami — Apenas Gatos Pretos",
    botId: "roblox-hanami-spirit-collector",
    description: "Foca na busca e absorção dos espíritos pretos mágicos de Hanami.",
    config: {
      mode: "black_only",
      weights: "integrations/robloxbot/vendor/bots/mm2_yolo_coin_collector/weights/yolo11_hanami_spirits.pt",
      conf_thres: 0.28,
      simulation_mode: false,
      jump_prob: 0.05,
      collection_dwell_time: 3.2,
      patrol_when_empty: true,
      approach_timeout_s: 3.5,
    },
  },
  {
    id: "hanami-street-mapping",
    name: "📍 Hanami — Mapear Ruas (gravar)",
    botId: "roblox-hanami-spirit-collector",
    description: "Você anda com WASD; o bot grava a rota. F4=ponto, F3=desfazer, END=salvar.",
    config: {
      mode: "street_mapping",
      weights: "integrations/robloxbot/vendor/bots/mm2_yolo_coin_collector/weights/yolo11_hanami_spirits.pt",
      conf_thres: 0.28,
      simulation_mode: false,
      send_preview: true,
      jump_prob: 0,
    },
  },
];

const INITIAL_CONFIGS: Record<string, BotConfig> = {};
BOT_REGISTRY.forEach((b) => {
  INITIAL_CONFIGS[b.id] = b.defaultConfig;
});

export const useBotsStore = create<BotsState>()(
  persist(
    (set, get) => ({
      activeTab: "home",
      robloxSubTab: "library",
      activeBotId: null,
      botStatus: {
        "roblox-mm2-coin-collector": "stopped",
      },
      botConfigs: INITIAL_CONFIGS,
      profiles: DEFAULT_PROFILES,
      activeProfileId: "mm2-normal",
      favorites: ["roblox-mm2-coin-collector"],

      logs: [
        {
          id: "log-init-1",
          timestamp: new Date().toLocaleTimeString("pt-BR"),
          level: "info",
          message: "Central de Bots carregada com carinho 💕",
        },
        {
          id: "log-init-2",
          timestamp: new Date().toLocaleTimeString("pt-BR"),
          level: "vision",
          message: "Módulo de Visão Computacional pronto.",
        },
      ],
      logFilter: "all",
      logSearch: "",

      latestDetections: [],
      detectedCoins: 0,
      detectedPlayers: 0,
      fpsCapture: 0,
      fpsInference: 0,
      previewImage: null,
      uptimeSecs: 0,
      lastAction: null,
      hardwareDevice: "GPU RTX 3070 Ti / CPU",

      activeLearning: {
        enabled: true,
        samplesCollected: 0,
        lastDetectionsCount: 0,
        lastReason: "",
        quota: null,
      },
      setActiveLearningEnabled: (enabled) =>
        set((state) => ({
          activeLearning: { ...state.activeLearning, enabled },
        })),
      updateActiveLearning: (data) =>
        set((state) => ({
          activeLearning: { ...state.activeLearning, ...data },
        })),

      environmentData: null,
      isCheckingEnv: false,
      discoveredModels: [],
      isLoadingModels: false,
      setupProgress: null,
      setSetupProgress: (progress) => set({ setupProgress: progress }),

      configModalBotId: null,
      screenSelectorOpen: false,

      setActiveTab: (tab) => set({ activeTab: tab }),
      setRobloxSubTab: (subTab) => set({ robloxSubTab: subTab }),
      setConfigModalBotId: (id) => set({ configModalBotId: id }),
      setScreenSelectorOpen: (open) => set({ screenSelectorOpen: open }),

      toggleFavorite: (botId) => {
        const favs = get().favorites;
        if (favs.includes(botId)) {
          set({ favorites: favs.filter((f) => f !== botId) });
        } else {
          set({ favorites: [...favs, botId] });
        }
      },

      setBotStatus: (botId, status) => {
        set((state) => ({
          botStatus: { ...state.botStatus, [botId]: status },
          activeBotId: status === "stopped" ? (state.activeBotId === botId ? null : state.activeBotId) : botId,
        }));
      },

      updateBotConfig: (botId, partial) => {
        set((state) => {
          const current = state.botConfigs[botId] || BOT_REGISTRY.find((b) => b.id === botId)?.defaultConfig;
          return {
            botConfigs: {
              ...state.botConfigs,
              [botId]: { ...current, ...partial } as BotConfig,
            },
          };
        });
      },

      applyProfile: (profile) => {
        set((state) => {
          const current = state.botConfigs[profile.botId] || BOT_REGISTRY.find((b) => b.id === profile.botId)?.defaultConfig;
          return {
            activeProfileId: profile.id,
            botConfigs: {
              ...state.botConfigs,
              [profile.botId]: { ...current, ...profile.config } as BotConfig,
            },
          };
        });
        get().addLog("info", `Perfil ativado: ${profile.name}`);
      },

      addProfile: (profile) => {
        set((state) => ({
          profiles: [...state.profiles, profile],
        }));
      },

      removeProfile: (profileId) => {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== profileId),
        }));
      },

      addLog: (level, message) => {
        const newLog: BotLogEntry = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toLocaleTimeString("pt-BR"),
          level,
          message,
        };
        set((state) => ({
          logs: [...state.logs.slice(-250), newLog],
        }));
      },

      clearLogs: () => set({ logs: [] }),
      setLogFilter: (filter) => set({ logFilter: filter }),
      setLogSearch: (search) => set({ logSearch: search }),

      updateRealtimeMetrics: (metrics) => {
        set((state) => ({
          latestDetections: metrics.detections !== undefined ? metrics.detections : state.latestDetections,
          fpsCapture: metrics.fpsCapture !== undefined ? metrics.fpsCapture : state.fpsCapture,
          fpsInference: metrics.fpsInference !== undefined ? metrics.fpsInference : state.fpsInference,
          detectedCoins: metrics.detectedCoins !== undefined ? metrics.detectedCoins : state.detectedCoins,
          detectedPlayers: metrics.detectedPlayers !== undefined ? metrics.detectedPlayers : state.detectedPlayers,
          previewImage: metrics.previewImage !== undefined ? metrics.previewImage : state.previewImage,
          lastAction: metrics.lastAction !== undefined ? metrics.lastAction : state.lastAction,
          hardwareDevice: metrics.device !== undefined ? metrics.device : state.hardwareDevice,
        }));
      },

      setEnvironmentData: (data) => set({ environmentData: data }),
      setIsCheckingEnv: (loading) => set({ isCheckingEnv: loading }),
      setDiscoveredModels: (models) => set({ discoveredModels: models }),
      setIsLoadingModels: (loading) => set({ isLoadingModels: loading }),
    }),
    {
      name: "pmm-bots-store",
      partialize: (state) => ({
        favorites: state.favorites,
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        botConfigs: state.botConfigs,
      }),
    }
  )
);
