import { describe, it, expect } from "vitest";
import {
  PROCEDURAL_PRESETS,
  generateRandomCrosshair,
} from "../src/projects/crosshair/engine/procedural-presets";

describe("Procedural Presets", () => {
  it("should have all requested presets properly initialized", () => {
    expect(PROCEDURAL_PRESETS.length).toBeGreaterThanOrEqual(14);

    const names = PROCEDURAL_PRESETS.map((p) => p.name);
    expect(names).toContain("Classic Green");
    expect(names).toContain("Classic Cyan");
    expect(names).toContain("Tiny Dot");
    expect(names).toContain("Precision Dot");
    expect(names).toContain("Cute Heart 💕");
    expect(names).toContain("Pink Dot 💗");
    expect(names).toContain("Sakura 🌸");
    expect(names).toContain("Circle Dot");
    expect(names).toContain("Star ✨");
    expect(names).toContain("Diamond 💎");
    expect(names).toContain("T-Crosshair");
    expect(names).toContain("Pixel Cross 👾");
    expect(names).toContain("Corner Brackets");
    expect(names).toContain("Purple Precision 💜");
  });

  it("should generate a valid procedural random crosshair with layers or classic config", () => {
    const random = generateRandomCrosshair();
    expect(random.id).toBeDefined();
    expect(random.name).toBeDefined();
    expect(random.classicConfig).toBeDefined();
    expect(random.classicConfig?.size).toBeGreaterThanOrEqual(0);
    expect(random.classicConfig?.thickness).toBeGreaterThanOrEqual(1);
  });
});
