export type GeometryShape =
  | "dot"
  | "line"
  | "cross"
  | "circle"
  | "hollow-circle"
  | "square"
  | "hollow-square"
  | "triangle"
  | "diamond"
  | "x"
  | "t"
  | "chevron"
  | "arrow"
  | "star"
  | "hexagon"
  | "octagon"
  | "brackets"
  | "corner-brackets"
  | "heart";

export type LayerType = "classic" | "geometry" | "emoji" | "icon" | "image";

export type GlowEffectType =
  | "none"
  | "neon"
  | "rgb-chroma"
  | "soft-aura"
  | "pulse-glow"
  | "heartbeat"
  | "spin"
  | "swing"
  | "sparkle"
  | "flame"
  | "electric"
  | "wave"
  | "vaporwave"
  | "ghost";


export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0 to 1
  x: number; // px offset from center
  y: number; // px offset from center
  scale: number; // multiplier
  rotation: number; // degrees
  color: string;
  // Glow, Bordas RGB e Animações
  glow?: boolean;
  glowColor?: string;
  glowRadius?: number; // em px (ex: 2 a 30)
  glowEffect?: GlowEffectType;
  animationSpeed?: number; // duração em segundos (ex: 0.8 a 4s)
}


export interface ClassicCrosshairLayer extends BaseLayer {
  type: "classic";
  size: number; // length of lines
  thickness: number;
  gap: number;
  dot: boolean;
  dotSize: number;
  outline: boolean;
  outlineThickness: number;
  outlineColor: string;
  showTop: boolean;
  showBottom: boolean;
  showLeft: boolean;
  showRight: boolean;
  tStyle: boolean;
  rounded: boolean;
}

export interface GeometryLayer extends BaseLayer {
  type: "geometry";
  shape: GeometryShape;
  size: number;
  thickness: number;
  hollow: boolean;
  outline: boolean;
  outlineThickness: number;
  outlineColor: string;
}

export interface EmojiLayer extends BaseLayer {
  type: "emoji";
  emoji: string;
  fontSize: number;
  glow: boolean;
  glowColor: string;
  shadow: boolean;
}

export interface IconLayer extends BaseLayer {
  type: "icon";
  iconName: string; // e.g. "lucide:heart" or "@iconify/..."
  size: number;
  collection?: string;
  license?: string;
  author?: string;
  strokeWidth?: number;
}

export interface ImageLayer extends BaseLayer {
  type: "image";
  src: string; // base64 / dataUrl or sanitized SVG dataUrl
  width: number;
  height: number;
  brightness: number; // 50 to 150 (100 normal)
  contrast: number; // 50 to 150 (100 normal)
  grayscale: boolean;
  threshold: number; // 0 to 255 (0 = disabled)
  invert: boolean;
  removeBgColor?: string; // hex to make transparent
  bgTolerance?: number; // 0 to 100
  outline: boolean;
  outlineColor: string;
  glow: boolean;
  glowColor: string;
}

export type CrosshairLayer =
  | ClassicCrosshairLayer
  | GeometryLayer
  | EmojiLayer
  | IconLayer
  | ImageLayer;

export interface CS2Config {
  cl_crosshairsize: number;
  cl_crosshairthickness: number;
  cl_crosshairgap: number;
  cl_crosshaircolor: number;
  cl_crosshaircolor_r: number;
  cl_crosshaircolor_g: number;
  cl_crosshaircolor_b: number;
  cl_crosshairalpha: number;
  cl_crosshairdot: number;
  cl_crosshair_drawoutline: number;
  cl_crosshair_outlinethickness: number;
  cl_crosshair_t: number;
  cl_crosshairgap_useweaponvalue?: number;
  cl_crosshairstyle?: number;
}

export interface CrosshairItem {
  id: string;
  name: string;
  description: string;
  category:
    | "Competitive"
    | "Minimal"
    | "Dot"
    | "Circle"
    | "Funny"
    | "Cute"
    | "Anime Inspired"
    | "Emoji"
    | "Icons"
    | "Sniper"
    | "High Visibility"
    | "Tiny"
    | "Large"
    | "Experimental"
    | "CS2"
    | "Custom";
  tags: string[];
  type: "classic" | "layered" | "emoji" | "icon" | "image" | "cs2";
  author: string;
  favorite: boolean;
  layers: CrosshairLayer[];
  classicConfig?: ClassicCrosshairLayer;
  cs2Commands?: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}
