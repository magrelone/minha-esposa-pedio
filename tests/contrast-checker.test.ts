import { describe, it, expect } from "vitest";
import { ContrastChecker } from "../src/projects/crosshair/engine/contrast-checker";

describe("ContrastChecker", () => {
  it("should calculate correct relative luminance for black and white", () => {
    expect(ContrastChecker.getLuminance("#000000")).toBeCloseTo(0, 2);
    expect(ContrastChecker.getLuminance("#ffffff")).toBeCloseTo(1, 2);
  });

  it("should calculate maximum contrast ratio (21:1) between black and white", () => {
    const ratio = ContrastChecker.getContrastRatio("#ffffff", "#000000");
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("should evaluate visibility across game backgrounds", () => {
    const results = ContrastChecker.evaluateColor("#00ff66");
    expect(results.length).toBe(ContrastChecker.TEST_BACKGROUNDS.length);
    for (const r of results) {
      expect(r.ratio).toBeGreaterThan(0);
      expect(["Excelente", "Bom", "Atenção", "Baixo"]).toContain(r.score);
    }
  });

  it("should simulate protanopia, deuteranopia, and tritanopia without crashing", () => {
    const color = "#ec4899";
    const protanopia = ContrastChecker.simulateColorVision(color, "protanopia");
    const deuteranopia = ContrastChecker.simulateColorVision(color, "deuteranopia");
    const tritanopia = ContrastChecker.simulateColorVision(color, "tritanopia");

    expect(protanopia).toMatch(/^#[0-9a-f]{6}$/i);
    expect(deuteranopia).toMatch(/^#[0-9a-f]{6}$/i);
    expect(tritanopia).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
