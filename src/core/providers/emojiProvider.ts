export type EmojiStyle = "system" | "twemoji" | "noto" | "openmoji";

export interface EmojiItem {
  char: string;
  name: string;
  category: string;
}

export class EmojiProvider {
  /**
   * Converts a unicode emoji character to its hexadecimal codepoints.
   */
  public static toCodePoints(emoji: string): string {
    const codePoints: string[] = [];
    for (const code of emoji) {
      const point = code.codePointAt(0);
      if (point !== undefined) {
        // Exclude variation selector 16 (\uFE0F) which can cause CDN lookup mismatches
        const hex = point.toString(16).toLowerCase();
        if (hex !== "fe0f") {
          codePoints.push(hex);
        }
      }
    }
    return codePoints.join("-");
  }

  /**
   * Resolves SVG image URL for a given emoji in the selected style.
   */
  public static getSvgUrl(emoji: string, style: EmojiStyle): string | null {
    if (style === "system") {
      return null; // System font text rendering
    }

    const hex = this.toCodePoints(emoji);

    switch (style) {
      case "twemoji":
        // Official jsDelivr mirror of Twitter Twemoji SVGs
        return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${hex}.svg`;

      case "noto":
        // Google Noto Emoji SVGs
        return `https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@main/svg/emoji_u${hex.replace(/-/g, "_")}.svg`;

      case "openmoji":
        // OpenMoji SVGs
        return `https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@master/color/svg/${hex.toUpperCase()}.svg`;

      default:
        return null;
    }
  }

  public static readonly STYLES: { id: EmojiStyle; label: string; description: string; emoji: string }[] = [
    {
      id: "system",
      label: "Sistema",
      description: "Emojis nativos do Windows (Segoe UI)",
      emoji: "💻",
    },
    {
      id: "twemoji",
      label: "Twemoji",
      description: "Estilo Twitter / Discord com traços limpos e nítidos",
      emoji: "🐦",
    },
    {
      id: "noto",
      label: "Noto Emoji",
      description: "Design clássico e polido do Google",
      emoji: "🎨",
    },
    {
      id: "openmoji",
      label: "OpenMoji",
      description: "Estilo artístico ilustrado e super fofo",
      emoji: "✨",
    },
  ];
}
