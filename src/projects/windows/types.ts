export type CompatibilityLevel = "SUPPORTED" | "EXPERIMENTAL" | "UNSUPPORTED";

export interface WindowsOsInfo {
  os_name: string;
  build_number: string;
  architecture: string;
  edition: string;
  is_win11: boolean;
  mica_supported: boolean;
  acrylic_supported: boolean;
  dark_mode_supported: boolean;
  current_theme_is_dark: boolean;
}

export type CustomizationCategory =
  | "quick"
  | "appearance"
  | "start_menu"
  | "taskbar"
  | "explorer"
  | "folders"
  | "wallpapers"
  | "live_wallpapers"
  | "widgets"
  | "cursors"
  | "fonts"
  | "sounds"
  | "login_lock"
  | "windows_style"
  | "themes"
  | "assets"
  | "backup"
  | "advanced";

export interface SystemChangeRecord {
  id: string;
  category: CustomizationCategory;
  title: string;
  description: string;
  timestamp: number;
  previousState: any;
  newState: any;
  status: "applied" | "reverted";
  canUndo: boolean;
  requiresExplorerRestart?: boolean;
}

export interface LicenseMetadata {
  id: string;
  licenseName: string; // ex: "CC0 1.0 Universal", "MIT", "Creative Commons BY 4.0", "Personal Use Only"
  licenseUrl: string;
  author: string;
  sourceUrl: string;
  commercialUse: boolean;
  redistributionAllowed: boolean;
  modificationAllowed: boolean;
  attributionRequired: boolean;
  attributionText?: string;
  localCopyAllowed: boolean;
  verifiedAt: string;
}

export interface AssetRecord {
  id: string;
  title: string;
  type: "icon" | "folder" | "cursor" | "wallpaper" | "sound" | "widget" | "font" | "theme";
  previewUrl: string;
  tags: string[];
  style: "windows11" | "windows10" | "retro_xp" | "cute" | "minimal" | "cyberpunk" | "gaming";
  license: LicenseMetadata;
  sha256Hash: string;
  compatibility: CompatibilityLevel;
}

export interface AppearanceConfig {
  mode: "light" | "dark" | "auto" | "custom";
  accentColor: string;
  transparency: boolean;
  opacity: number;
  useMica: boolean;
  useAcrylic: boolean;
  roundedCorners: boolean;
  dropShadows: boolean;
  titleBarAccent: boolean;
}

export interface StartMenuConfig {
  layout: "windows11" | "windows10" | "windows7" | "classic" | "minimal" | "custom_launcher" | "hybrid_win7_11";
  alignment: "center" | "left";
  showRecentFiles: boolean;
  showRecommended: boolean;
  showPowerShortcuts: boolean;
  searchBarVisible: boolean;
  iconSize: "small" | "medium" | "large";
  replaceNativeStartButton?: boolean;
}

export interface TaskbarConfig {
  position: "bottom" | "top" | "left" | "right";
  alignment: "center" | "left";
  transparencyMode: "default" | "transparent" | "blur" | "acrylic";
  showSecondsInClock: boolean;
  showSearch: boolean;
  showTaskView: boolean;
  showWidgetsBadge: boolean;
  compactIcons: boolean;
}

export interface ExplorerConfig {
  compactView: boolean;
  showFileExtensions: boolean;
  showHiddenFiles: boolean;
  showPreviewPane: boolean;
  showDetailsPane: boolean;
  openTo: "home" | "this_pc";
}

export interface WallpaperConfig {
  activeWallpaperId: string;
  wallpaperPath: string;
  fitMode: "fill" | "fit" | "stretch" | "center" | "tile" | "span";
  isLive: boolean;
  liveType?: "video" | "gif" | "canvas" | "web";
  pauseWhenFullscreen: boolean;
  pauseOnBattery: boolean;
  fpsLimit: 30 | 60;
}

export interface SoundConfig {
  activePackId: string;
  packName: string;
  playStartupSound: boolean;
  playNotificationSound: boolean;
  volume: number;
}

export interface CursorConfig {
  activePackId: string;
  packName: string;
  sizeMultiplier: number;
  trailEnabled: boolean;
}

export interface DesktopWidgetConfig {
  id: string;
  title: string;
  type: "clock" | "calendar" | "weather" | "cpu_ram" | "music" | "notes" | "todo";
  enabled: boolean;
  position: { x: number; y: number };
  pinned: boolean;
  alwaysOnTop: boolean;
  clickThrough: boolean;
  style: "cute" | "fluent" | "minimal" | "retro" | "neon";
}
