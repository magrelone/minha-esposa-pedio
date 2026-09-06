import { LicenseMetadata } from "../types";
import { PRESET_LICENSES } from "./licenseService";

export type WallpaperCategory = "anime" | "manga" | "manhwa" | "cute" | "gaming" | "minimal";
export type WallpaperResolution = "4k" | "1080p" | "ultrawide";

export interface ExtendedWallpaperItem {
  id: string;
  title: string;
  category: WallpaperCategory;
  categoryLabel: string;
  resolution: WallpaperResolution;
  resolutionLabel: string;
  previewUrl: string;
  tags: string[];
  dominantColor: string;
  license: LicenseMetadata;
  isAnimatedAvailable?: boolean;
}

export const EXTENDED_WALLPAPERS: ExtendedWallpaperItem[] = [
  // --- ANIMES ---
  {
    id: "wp_anime_lofi_rain",
    title: "Lofi Rainy Night Study",
    category: "anime",
    categoryLabel: "Anime",
    resolution: "4k",
    resolutionLabel: "4K UHD",
    previewUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80",
    tags: ["anime", "lofi", "rain", "cozy", "study", "chill"],
    dominantColor: "#3b82f6",
    license: PRESET_LICENSES.cc0,
  },
  {
    id: "wp_anime_sakura_shrine",
    title: "Sakura Torii Sunset",
    category: "anime",
    categoryLabel: "Anime",
    resolution: "4k",
    resolutionLabel: "4K UHD",
    previewUrl: "https://images.unsplash.com/photo-1528164344705-475426879c0d?w=1000&auto=format&fit=crop&q=80",
    tags: ["anime", "sakura", "japan", "sunset", "pink", "peaceful"],
    dominantColor: "#ec4899",
    license: PRESET_LICENSES.cc_by,
  },
  {
    id: "wp_anime_cyber_city",
    title: "Neo-Tokyo Cyber Streets",
    category: "anime",
    categoryLabel: "Anime",
    resolution: "4k",
    resolutionLabel: "4K UHD",
    previewUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1000&auto=format&fit=crop&q=80",
    tags: ["anime", "cyberpunk", "neon", "tokyo", "futuristic", "night"],
    dominantColor: "#8b5cf6",
    license: PRESET_LICENSES.cc0,
  },
  {
    id: "wp_anime_cloud_sea",
    title: "Sea of Clouds & Distant Sky",
    category: "anime",
    categoryLabel: "Anime",
    resolution: "ultrawide",
    resolutionLabel: "Ultrawide 21:9",
    previewUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop&q=80",
    tags: ["anime", "clouds", "sky", "makoto shinkai", "fantasy", "scenery"],
    dominantColor: "#0ea5e9",
    license: PRESET_LICENSES.cc0,
  },

  // --- MANGÁS (Preto & Branco / Estilo Clássico) ---
  {
    id: "wp_manga_panel_epic",
    title: "Manga Panel Action Strike",
    category: "manga",
    categoryLabel: "Mangá",
    resolution: "4k",
    resolutionLabel: "4K UHD",
    previewUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&auto=format&fit=crop&q=80",
    tags: ["manga", "black and white", "dark", "shonen", "ink", "action"],
    dominantColor: "#18181b",
    license: PRESET_LICENSES.cc_by,
  },
  {
    id: "wp_manga_tokyo_ink",
    title: "Ink Silhouette of Tokyo",
    category: "manga",
    categoryLabel: "Mangá",
    resolution: "1080p",
    resolutionLabel: "Full HD",
    previewUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1000&auto=format&fit=crop&q=80",
    tags: ["manga", "ink", "art", "monochrome", "retro", "dark"],
    dominantColor: "#27272a",
    license: PRESET_LICENSES.cc0,
  },
  {
    id: "wp_manga_samurai_moon",
    title: "Moonlit Ronin Manga Art",
    category: "manga",
    categoryLabel: "Mangá",
    resolution: "4k",
    resolutionLabel: "4K UHD",
    previewUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80",
    tags: ["manga", "samurai", "katana", "moon", "contrast", "warrior"],
    dominantColor: "#09090b",
    license: PRESET_LICENSES.cc_by,
  },

  // --- MANHWAS (Webtoons Coloridos / Fantasia Estilo Solo Leveling) ---
  {
    id: "wp_manhwa_shadow_monarch",
    title: "Shadow Realm Monarch Awakening",
    category: "manhwa",
    categoryLabel: "Manhwa",
    resolution: "4k",
    resolutionLabel: "4K UHD",
    previewUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80",
    tags: ["manhwa", "solo leveling", "shadow", "blue flame", "dungeon", "action"],
    dominantColor: "#3b82f6",
    license: PRESET_LICENSES.personal_only,
  },
  {
    id: "wp_manhwa_dungeon_gate",
    title: "Purple Dungeon Crystal Gate",
    category: "manhwa",
    categoryLabel: "Manhwa",
    resolution: "4k",
    resolutionLabel: "4K UHD",
    previewUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1000&auto=format&fit=crop&q=80",
    tags: ["manhwa", "magic", "portal", "purple", "fantasy", "awakened"],
    dominantColor: "#a855f7",
    license: PRESET_LICENSES.cc_by,
  },
  {
    id: "wp_manhwa_pastel_romance",
    title: "Empress Palace Garden Pastel",
    category: "manhwa",
    categoryLabel: "Manhwa",
    resolution: "1080p",
    resolutionLabel: "Full HD",
    previewUrl: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=1000&auto=format&fit=crop&q=80",
    tags: ["manhwa", "romance", "palace", "flowers", "pastel", "cute"],
    dominantColor: "#f472b6",
    license: PRESET_LICENSES.cc0,
  },

  // --- CUTE & PASTEL (Feito para a Esposa 💕) ---
  {
    id: "wp_cute_candy_clouds",
    title: "Pink Candy Clouds & Stars 💕",
    category: "cute",
    categoryLabel: "Cute 💕",
    resolution: "4k",
    resolutionLabel: "4K UHD",
    previewUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1000&auto=format&fit=crop&q=80",
    tags: ["cute", "pink", "candy", "clouds", "dreamy", "love"],
    dominantColor: "#ec4899",
    license: PRESET_LICENSES.cc0,
  },
  {
    id: "wp_cute_neko_cafe",
    title: "Kawaii Neko Bakery & Tea",
    category: "cute",
    categoryLabel: "Cute 💕",
    resolution: "1080p",
    resolutionLabel: "Full HD",
    previewUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1000&auto=format&fit=crop&q=80",
    tags: ["cute", "cat", "neko", "pastel", "cafe", "sweet"],
    dominantColor: "#f43f5e",
    license: PRESET_LICENSES.cc_by,
  },
  {
    id: "wp_cute_lavender_haze",
    title: "Soft Lavender Field Bloom",
    category: "cute",
    categoryLabel: "Cute 💕",
    resolution: "ultrawide",
    resolutionLabel: "Ultrawide 21:9",
    previewUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&auto=format&fit=crop&q=80",
    tags: ["cute", "lavender", "purple", "flowers", "nature", "peace"],
    dominantColor: "#c084fc",
    license: PRESET_LICENSES.cc0,
  },

  // --- GAMING & SCI-FI ---
  {
    id: "wp_gaming_neon_grid",
    title: "Retro 80s Synthwave Highway",
    category: "gaming",
    categoryLabel: "Gaming",
    resolution: "4k",
    resolutionLabel: "4K UHD",
    previewUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&auto=format&fit=crop&q=80",
    tags: ["gaming", "synthwave", "cyberpunk", "neon", "sunset", "speed"],
    dominantColor: "#eab308",
    license: PRESET_LICENSES.cc0,
  },
  {
    id: "wp_gaming_mecha_pilot",
    title: "Titan Mecha Hangar 4K",
    category: "gaming",
    categoryLabel: "Gaming",
    resolution: "4k",
    resolutionLabel: "4K UHD",
    previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80",
    tags: ["gaming", "robot", "mecha", "scifi", "dark", "futuristic"],
    dominantColor: "#0284c7",
    license: PRESET_LICENSES.mit,
  },

  // --- MINIMALISTA & FLUID ---
  {
    id: "wp_minimal_dark_waves",
    title: "Silk Waves Dark Gradient",
    category: "minimal",
    categoryLabel: "Minimal",
    resolution: "4k",
    resolutionLabel: "4K UHD",
    previewUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1000&auto=format&fit=crop&q=80",
    tags: ["minimal", "dark", "gradient", "fluent", "clean", "amoled"],
    dominantColor: "#1e1b4b",
    license: PRESET_LICENSES.mit,
  },
];
