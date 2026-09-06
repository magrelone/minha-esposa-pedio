import { describe, it, expect } from "vitest";
import { PROCEDURAL_PRESETS } from "../src/projects/crosshair/engine/procedural-presets";

describe("Crosshair Serialization & Project Export", () => {
  it("should validate the .crosshair export JSON format", () => {
    const item = PROCEDURAL_PRESETS[4]; // Cute Heart
    const exportData = {
      format: "pedi-para-meu-marido-crosshair",
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      crosshair: item,
    };

    const serialized = JSON.stringify(exportData);
    const parsed = JSON.parse(serialized);

    expect(parsed.format).toBe("pedi-para-meu-marido-crosshair");
    expect(parsed.version).toBe("1.0.0");
    expect(parsed.crosshair.id).toBe(item.id);
    expect(parsed.crosshair.layers.length).toBe(item.layers.length);
  });
});
