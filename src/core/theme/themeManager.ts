import { create } from "zustand";

export type ThemeId =
  | "sakura"
  | "lilas"
  | "morango"
  | "noite"
  | "clean"
  | "dark"
  | "ceu"
  | "jardim";

export interface ThemeOption {
  id: ThemeId;
  name: string;
  emoji: string;
  description: string;
  primaryColor: string;
  bgColor: string;
}

export const AVAILABLE_THEMES: ThemeOption[] = [
  {
    id: "sakura",
    name: "Sakura",
    emoji: "🌸",
    description: "Rosa pastel delicado com toques de cerejeira",
    primaryColor: "#ec4899",
    bgColor: "#fff5f7",
  },
  {
    id: "lilas",
    name: "Lilás",
    emoji: "💜",
    description: "Lavanda suave e violeta aconchegante",
    primaryColor: "#a855f7",
    bgColor: "#f8f6ff",
  },
  {
    id: "morango",
    name: "Morango",
    emoji: "🍓",
    description: "Vermelho morango pastel e creme doce",
    primaryColor: "#f43f5e",
    bgColor: "#fff1f2",
  },
  {
    id: "noite",
    name: "Noite",
    emoji: "🌙",
    description: "Modo escuro calmo com brilho lilás",
    primaryColor: "#f472b6",
    bgColor: "#0f172a",
  },
  {
    id: "clean",
    name: "Clean",
    emoji: "🤍",
    description: "Minimalista, neutro e elegante",
    primaryColor: "#64748b",
    bgColor: "#f8fafc",
  },
  {
    id: "dark",
    name: "Dark",
    emoji: "🖤",
    description: "Preto fosco moderno com acentos neon",
    primaryColor: "#ec4899",
    bgColor: "#09090b",
  },
  {
    id: "ceu",
    name: "Céu",
    emoji: "🩵",
    description: "Azul pastel refrescante e nuvens leves",
    primaryColor: "#0284c7",
    bgColor: "#f0f9ff",
  },
  {
    id: "jardim",
    name: "Jardim",
    emoji: "🌷",
    description: "Verde sálvia botânico e toques florais",
    primaryColor: "#10b981",
    bgColor: "#f2fbf4",
  },
];

interface ThemeState {
  currentTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const saved = (localStorage.getItem("app_theme") as ThemeId) || "sakura";
  document.documentElement.setAttribute("data-theme", saved);

  return {
    currentTheme: saved,
    setTheme: (theme) => {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("app_theme", theme);
      set({ currentTheme: theme });
    },
  };
});
