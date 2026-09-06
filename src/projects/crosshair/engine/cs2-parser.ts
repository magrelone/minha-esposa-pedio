import { ClassicCrosshairLayer, CS2Config } from "../types";

/**
 * Robust parser & exporter for Counter-Strike 2 crosshair console commands.
 */
export class CS2Parser {
  /**
   * Parses arbitrary console input or multi-line text containing CS2 cl_crosshair commands.
   * Ignores irrelevant or unknown commands.
   */
  public static parse(input: string): Partial<CS2Config> {
    const lines = input.split(/[\r\n;]+/);
    const result: Partial<CS2Config> = {};

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("//")) continue;

      // Matches: <command> <value> or <command> = <value> or <command> "<value>"
      const match = line.match(/^(cl_crosshair[a-z0-9_]*)\s*[=]?\s*["']?(-?[\d.]+)["']?/i);
      if (!match) continue;

      const cmd = match[1].toLowerCase();
      const val = parseFloat(match[2]);

      switch (cmd) {
        case "cl_crosshairsize":
          result.cl_crosshairsize = val;
          break;
        case "cl_crosshairthickness":
          result.cl_crosshairthickness = val;
          break;
        case "cl_crosshairgap":
          result.cl_crosshairgap = val;
          break;
        case "cl_crosshaircolor":
          result.cl_crosshaircolor = Math.round(val);
          break;
        case "cl_crosshaircolor_r":
          result.cl_crosshaircolor_r = Math.min(255, Math.max(0, Math.round(val)));
          break;
        case "cl_crosshaircolor_g":
          result.cl_crosshaircolor_g = Math.min(255, Math.max(0, Math.round(val)));
          break;
        case "cl_crosshaircolor_b":
          result.cl_crosshaircolor_b = Math.min(255, Math.max(0, Math.round(val)));
          break;
        case "cl_crosshairalpha":
          result.cl_crosshairalpha = Math.min(255, Math.max(0, Math.round(val)));
          break;
        case "cl_crosshairdot":
          result.cl_crosshairdot = Math.round(val);
          break;
        case "cl_crosshair_drawoutline":
          result.cl_crosshair_drawoutline = Math.round(val);
          break;
        case "cl_crosshair_outlinethickness":
          result.cl_crosshair_outlinethickness = val;
          break;
        case "cl_crosshair_t":
          result.cl_crosshair_t = Math.round(val);
          break;
      }
    }

    return result;
  }

  /**
   * Converts parsed CS2 commands into a ClassicCrosshairLayer object.
   */
  public static toClassicLayer(cs2: Partial<CS2Config>): ClassicCrosshairLayer {
    // Determine color
    let hexColor = "#00ff66";
    if (
      cs2.cl_crosshaircolor_r !== undefined ||
      cs2.cl_crosshaircolor_g !== undefined ||
      cs2.cl_crosshaircolor_b !== undefined
    ) {
      const r = cs2.cl_crosshaircolor_r ?? 0;
      const g = cs2.cl_crosshaircolor_g ?? 255;
      const b = cs2.cl_crosshaircolor_b ?? 0;
      hexColor = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    } else if (cs2.cl_crosshaircolor !== undefined) {
      // CS predefined colors: 0=red, 1=green, 2=yellow, 3=blue, 4=cyan, 5=custom
      const palette = ["#ff3333", "#33ff33", "#ffff33", "#3333ff", "#33ffff"];
      if (cs2.cl_crosshaircolor >= 0 && cs2.cl_crosshaircolor < 5) {
        hexColor = palette[cs2.cl_crosshaircolor];
      }
    }

    const opacity =
      cs2.cl_crosshairalpha !== undefined ? Math.max(0.1, cs2.cl_crosshairalpha / 255) : 1;

    return {
      id: "classic-layer",
      name: "Mira Clássica CS2",
      type: "classic",
      visible: true,
      locked: false,
      opacity,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      color: hexColor,
      size: (cs2.cl_crosshairsize ?? 3) * 4, // Scale for UI viewability
      thickness: Math.max(1, (cs2.cl_crosshairthickness ?? 1) * 2),
      gap: (cs2.cl_crosshairgap ?? -1) * 2,
      dot: (cs2.cl_crosshairdot ?? 0) === 1,
      dotSize: Math.max(2, (cs2.cl_crosshairthickness ?? 1) * 2),
      outline: (cs2.cl_crosshair_drawoutline ?? 1) === 1,
      outlineThickness: Math.max(1, Math.round(cs2.cl_crosshair_outlinethickness ?? 1)),
      outlineColor: "#000000",
      showTop: true,
      showBottom: true,
      showLeft: true,
      showRight: true,
      tStyle: (cs2.cl_crosshair_t ?? 0) === 1,
      rounded: false,
    };
  }

  /**
   * Generates formatted CS2 console commands from a ClassicCrosshairLayer.
   */
  public static toCommands(layer: ClassicCrosshairLayer): string {
    const hex = layer.color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 255;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const alpha = Math.round(layer.opacity * 255);

    const size = (layer.size / 4).toFixed(1);
    const thickness = (layer.thickness / 2).toFixed(1);
    const gap = (layer.gap / 2).toFixed(1);

    return [
      `cl_crosshairstyle 4;`,
      `cl_crosshairsize ${size};`,
      `cl_crosshairthickness ${thickness};`,
      `cl_crosshairgap ${gap};`,
      `cl_crosshaircolor 5;`,
      `cl_crosshaircolor_r ${r};`,
      `cl_crosshaircolor_g ${g};`,
      `cl_crosshaircolor_b ${b};`,
      `cl_crosshairalpha ${alpha};`,
      `cl_crosshairdot ${layer.dot ? 1 : 0};`,
      `cl_crosshair_drawoutline ${layer.outline ? 1 : 0};`,
      `cl_crosshair_outlinethickness ${layer.outlineThickness};`,
      `cl_crosshair_t ${layer.tStyle ? 1 : 0};`,
    ].join(" ");
  }
}
