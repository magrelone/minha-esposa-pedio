import { create } from "zustand";

export type DiceBearStyle =
  | "lorelei"
  | "adventurer"
  | "micah"
  | "fun-emoji"
  | "bottts"
  | "thumbs";

export interface DiceBearStyleOption {
  id: DiceBearStyle;
  name: string;
  emoji: string;
  description: string;
}

export const DICEBEAR_STYLES: DiceBearStyleOption[] = [
  {
    id: "lorelei",
    name: "Lorelei",
    emoji: "🌸",
    description: "Ilustração delicada, meiga e super fofinha",
  },
  {
    id: "adventurer",
    name: "Adventurer",
    emoji: "🗡️",
    description: "Estilo RPG fofo pronto para aventuras e jogos",
  },
  {
    id: "micah",
    name: "Micah",
    emoji: "✨",
    description: "Retrato artístico moderno e elegante",
  },
  {
    id: "fun-emoji",
    name: "Fun Emoji",
    emoji: "🥰",
    description: "Carinhas expressivas e divertidas",
  },
  {
    id: "thumbs",
    name: "Thumbs",
    emoji: "👍",
    description: "Personagens fofos em formato amigável",
  },
  {
    id: "bottts",
    name: "Robozinho",
    emoji: "🤖",
    description: "Robôs simpáticos e criativos",
  },
];

export interface UserProfile {
  name: string;
  nickname: string;
  avatarStyle: DiceBearStyle;
  seed: string;
  bgColor: string;
  specialNote: string;
}

interface ProfileStore {
  wifeProfile: UserProfile;
  husbandProfile: UserProfile;
  updateWifeProfile: (patch: Partial<UserProfile>) => void;
  updateHusbandProfile: (patch: Partial<UserProfile>) => void;
  getWifeAvatarUrl: () => string;
}

const STORAGE_KEY_WIFE = "pmm_profile_wife";
const STORAGE_KEY_HUSBAND = "pmm_profile_husband";

const DEFAULT_WIFE: UserProfile = {
  name: "Minha Esposa Linda",
  nickname: "Meu Amor 💕",
  avatarStyle: "lorelei",
  seed: "Princesa",
  bgColor: "ffd5dc,ffdfba",
  specialNote: "A dona de todos os meus códigos e de todo o meu coração ✨",
};

const DEFAULT_HUSBAND: UserProfile = {
  name: "Seu Marido",
  nickname: "Maridão 💖",
  avatarStyle: "adventurer",
  seed: "Marido",
  bgColor: "b6e3f4,c0aede",
  specialNote: "Sempre pronto para programar tudo o que você pedir!",
};

export function getDiceBearAvatarUrl(
  style: DiceBearStyle,
  seed: string,
  bgColor: string = "ffd5dc,ffdfba"
): string {
  const cleanSeed = encodeURIComponent(seed.trim() || "Amor");
  const cleanBg = encodeURIComponent(bgColor.replace("#", ""));
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${cleanSeed}&backgroundColor=${cleanBg}`;
}

export const useProfileStore = create<ProfileStore>((set, get) => {
  const isBrowser = typeof localStorage !== "undefined";
  const savedWife = isBrowser ? localStorage.getItem(STORAGE_KEY_WIFE) : null;
  const savedHusband = isBrowser ? localStorage.getItem(STORAGE_KEY_HUSBAND) : null;

  const wife = savedWife ? { ...DEFAULT_WIFE, ...JSON.parse(savedWife) } : DEFAULT_WIFE;
  const husband = savedHusband ? { ...DEFAULT_HUSBAND, ...JSON.parse(savedHusband) } : DEFAULT_HUSBAND;

  return {
    wifeProfile: wife,
    husbandProfile: husband,

    updateWifeProfile: (patch) => {
      const next = { ...get().wifeProfile, ...patch };
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY_WIFE, JSON.stringify(next));
      }
      set({ wifeProfile: next });
    },

    updateHusbandProfile: (patch) => {
      const next = { ...get().husbandProfile, ...patch };
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY_HUSBAND, JSON.stringify(next));
      }
      set({ husbandProfile: next });
    },

    getWifeAvatarUrl: () => {
      const p = get().wifeProfile;
      return getDiceBearAvatarUrl(p.avatarStyle, p.seed, p.bgColor);
    },
  };
});

