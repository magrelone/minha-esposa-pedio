export type BotCapability =
  | "vision"
  | "keyboard"
  | "mouse"
  | "object_detection"
  | "movement"
  | "gpu"
  | "models";

export type BotStatus =
  | "stopped"
  | "initializing"
  | "running"
  | "paused"
  | "error";

export interface BotConfig {
  weights: string;
  device: "auto" | "cuda" | "cpu";
  conf_thres: number;
  iou_thres: number;
  simulation_mode: boolean;
  send_preview: boolean;
  preview_fps: number;
  mode: "coin_only" | "coin_and_players" | "all_spirits" | "white_only" | "black_only" | "patrol_only" | "street_mapping" | string;
  jump_prob: number;
  capture_mode: "auto" | "window" | "region" | "fullscreen";
  region: [number, number, number, number] | null;
  window_title: string;
  monitor_index?: number;
  collection_dwell_time?: number;
  waypoint_route?: string;
  rest_enabled?: boolean;
  work_duration_mins?: number;
  rest_duration_mins?: number;
  /** Hanami: continua andando pelos waypoints mesmo sem urso (mapeamento). */
  patrol_when_empty?: boolean;
  /** Hanami: desiste de um alvo fantasma e volta à patrulha após N segundos. */
  approach_timeout_s?: number;
  /** Aprendizado Contínuo com Google Gemini 2.0 Flash em tempo real */
  active_learning?: boolean;
  gemini_api_key?: string;
}

export interface BotSetupProgress {
  isInstalling: boolean;
  step: string;
  percent: number;
  message: string;
  success?: boolean;
}

export interface ActiveLearningState {
  enabled: boolean;
  samplesCollected: number;
  lastDetectionsCount: number;
  lastReason: string;
  quota?: {
    requests_today: number;
    daily_limit: number;
    remaining_today: number;
    percent_used: number;
  } | null;
}

export interface BotDefinition {
  id: string;
  name: string;
  game: string;
  category: string;
  provider: string;
  description: string;
  version: string;
  icon: string;
  installed: boolean;
  capabilities: BotCapability[];
  requirements: {
    python: string;
    gpuRecommended: boolean;
    minModelSizeMb: number;
    description: string;
  };
  supportedModels: string[];
  defaultConfig: BotConfig;
}

export interface VisionDetection {
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
  rel_center: [number, number];
}

export interface BotLogEntry {
  id: string;
  timestamp: string;
  level: "info" | "vision" | "movement" | "warning" | "error";
  message: string;
}

export interface VisionModelItem {
  id: string;
  filename: string;
  path: string;
  sizeBytes: number;
  sizeFormatted: string;
  provider: string;
  classes: string[];
  dateDiscovered: string;
  deviceSupport: string;
  status: string;
  notes: string;
}

export interface BotProfile {
  id: string;
  name: string;
  botId: string;
  description: string;
  config: Partial<BotConfig>;
}

export type BotTab =
  | "home"
  | "my-bots"
  | "library"
  | "roblox"
  | "vision"
  | "mapping"
  | "models"
  | "training"
  | "datasets"
  | "wizard"
  | "logs"
  | "diagnostics"
  | "about";

export type RobloxSubTab =
  | "library"
  | "installed"
  | "active"
  | "models"
  | "profiles";
