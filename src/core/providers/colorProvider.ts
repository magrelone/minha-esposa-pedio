export interface CuteColorItem {
  hex: string;
  name: string;
  category: "Doces & Mimos" | "Florais & Pastel" | "Vibrantes & Neon" | "Clássicos & Neutros";
  tags: string[];
  emoji: string;
}

export const OPEN_COLORS_CATALOG: CuteColorItem[] = [
  // Doces & Mimos
  { hex: "#ff69b4", name: "Hot Pink", emoji: "💗", category: "Doces & Mimos", tags: ["rosa", "fofo", "doce"] },
  { hex: "#fb7185", name: "Strawberry Glaze", emoji: "🍓", category: "Doces & Mimos", tags: ["morango", "glaze", "vermelho"] },
  { hex: "#f472b6", name: "Cotton Candy", emoji: "🍬", category: "Doces & Mimos", tags: ["algodao", "doce", "rosa"] },
  { hex: "#fdba74", name: "Peach Blossom", emoji: "🍑", category: "Doces & Mimos", tags: ["pessego", "suave", "laranja"] },
  { hex: "#fef08a", name: "Lemon Soufflé", emoji: "🍋", category: "Doces & Mimos", tags: ["limao", "amarelo", "pastel"] },
  { hex: "#fbbf24", name: "Golden Honey", emoji: "🍯", category: "Doces & Mimos", tags: ["mel", "dourado", "brilho"] },

  // Florais & Pastel
  { hex: "#ffccd5", name: "Sakura Mist", emoji: "🌸", category: "Florais & Pastel", tags: ["sakura", "cerejeira", "rosa"] },
  { hex: "#c084fc", name: "Lilac Dream", emoji: "💜", category: "Florais & Pastel", tags: ["lilas", "lavanda", "sonho"] },
  { hex: "#7dd3fc", name: "Baby Sky", emoji: "🩵", category: "Florais & Pastel", tags: ["ceu", "azul", "bebe"] },
  { hex: "#6ee7b7", name: "Mint Macaron", emoji: "🍵", category: "Florais & Pastel", tags: ["menta", "macaron", "verde"] },
  { hex: "#e9d5ff", name: "Lavender Silk", emoji: "🪻", category: "Florais & Pastel", tags: ["lavanda", "seda", "lilas"] },
  { hex: "#fecdd3", name: "Blush Peony", emoji: "🌷", category: "Florais & Pastel", tags: ["peonia", "blush", "rosa"] },

  // Vibrantes & Neon
  { hex: "#00ff66", name: "Competitive Green", emoji: "🎯", category: "Vibrantes & Neon", tags: ["verde", "competitivo", "mira"] },
  { hex: "#00f0ff", name: "Cyber Cyan", emoji: "💠", category: "Vibrantes & Neon", tags: ["cyan", "neon", "cyber"] },
  { hex: "#39ff14", name: "Neon Lime", emoji: "⚡", category: "Vibrantes & Neon", tags: ["neon", "lima", "eletrico"] },
  { hex: "#ff007f", name: "Laser Magenta", emoji: "✨", category: "Vibrantes & Neon", tags: ["laser", "magenta", "brilhante"] },
  { hex: "#8b5cf6", name: "Twilight Violet", emoji: "🌙", category: "Vibrantes & Neon", tags: ["violeta", "crepusculo", "noite"] },
  { hex: "#10b981", name: "Vivid Emerald", emoji: "🌿", category: "Vibrantes & Neon", tags: ["esmeralda", "verde", "natureza"] },

  // Clássicos & Neutros
  { hex: "#ffffff", name: "Pure Marshmallow", emoji: "🤍", category: "Clássicos & Neutros", tags: ["branco", "marshmallow", "puro"] },
  { hex: "#000000", name: "Obsidian Velvet", emoji: "🖤", category: "Clássicos & Neutros", tags: ["preto", "obsidiana", "veludo"] },
  { hex: "#94a3b8", name: "Silver Whisper", emoji: "🩶", category: "Clássicos & Neutros", tags: ["prata", "cinza", "suave"] },
  { hex: "#64748b", name: "Clean Slate", emoji: "🏛️", category: "Clássicos & Neutros", tags: ["ardosia", "clean", "elegante"] },
];

export class ColorProvider {
  public static getAll(): CuteColorItem[] {
    return OPEN_COLORS_CATALOG;
  }

  public static findByHex(hex: string): CuteColorItem | undefined {
    const clean = hex.toLowerCase();
    return OPEN_COLORS_CATALOG.find((c) => c.hex.toLowerCase() === clean);
  }

  public static getCategories(): string[] {
    return Array.from(new Set(OPEN_COLORS_CATALOG.map((c) => c.category)));
  }
}
