export interface ContrastResult {
  bgName: string;
  bgColor: string;
  ratio: number;
  score: "Excelente" | "Bom" | "Atenção" | "Baixo";
}

export class ContrastChecker {
  public static readonly TEST_BACKGROUNDS = [
    { name: "Cenário Escuro / Noite", color: "#111827" },
    { name: "Cenário Claro / Neve", color: "#f9fafb" },
    { name: "Vegetação / Floresta", color: "#1e3a1e" },
    { name: "Poeira / Deserto / Mirage", color: "#a27b5c" },
    { name: "Céu Ensolarado", color: "#60a5fa" },
    { name: "Concreto Urbano", color: "#6b7280" },
  ];

  /**
   * Calculates relative luminance of a color.
   */
  public static getLuminance(hex: string): number {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;

    const toLinear = (c: number) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  }

  /**
   * Calculates contrast ratio (1:1 to 21:1).
   */
  public static getContrastRatio(color1: string, color2: string): number {
    const l1 = this.getLuminance(color1);
    const l2 = this.getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Evaluates visibility of a crosshair color across key game backgrounds.
   */
  public static evaluateColor(crosshairColor: string): ContrastResult[] {
    return this.TEST_BACKGROUNDS.map((bg) => {
      const ratio = parseFloat(this.getContrastRatio(crosshairColor, bg.color).toFixed(2));
      let score: ContrastResult["score"] = "Baixo";
      if (ratio >= 7) score = "Excelente";
      else if (ratio >= 4.5) score = "Bom";
      else if (ratio >= 3) score = "Atenção";

      return {
        bgName: bg.name,
        bgColor: bg.color,
        ratio,
        score,
      };
    });
  }

  /**
   * Simulates common color perception deficiencies (Protanopia, Deuteranopia, Tritanopia).
   */
  public static simulateColorVision(
    hex: string,
    type: "protanopia" | "deuteranopia" | "tritanopia"
  ): string {
    const clean = hex.replace("#", "");
    let r = parseInt(clean.substring(0, 2), 16);
    let g = parseInt(clean.substring(2, 4), 16);
    let b = parseInt(clean.substring(4, 6), 16);

    let nr = r, ng = g, nb = b;

    if (type === "protanopia") {
      nr = 0.56667 * r + 0.43333 * g;
      ng = 0.55833 * r + 0.44167 * g;
      nb = 0.24167 * g + 0.75833 * b;
    } else if (type === "deuteranopia") {
      nr = 0.625 * r + 0.375 * g;
      ng = 0.7 * r + 0.3 * g;
      nb = 0.3 * g + 0.7 * b;
    } else if (type === "tritanopia") {
      nr = 0.95 * r + 0.05 * g;
      ng = 0.43333 * g + 0.56667 * b;
      nb = 0.475 * g + 0.525 * b;
    }

    const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
    return `#${clamp(nr).toString(16).padStart(2, "0")}${clamp(ng).toString(16).padStart(2, "0")}${clamp(nb).toString(16).padStart(2, "0")}`;
  }
}
