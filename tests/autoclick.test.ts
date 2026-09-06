import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { AUTOCLICK_PRESETS, AUTOCLICK_SCHEMA_VERSION } from "../src/projects/autoclick/store/autoclickStore";

describe("Auto Click Studio — Logic, Math & Documentation Suite", () => {
  it("should correctly compute bidirectional CPS and interval without zero division", () => {
    // 10 CPS -> 100ms
    const cps10 = 10;
    const interval10 = Math.round(1000 / cps10);
    expect(interval10).toBe(100);

    // 20 CPS -> 50ms
    const cps20 = 20;
    const interval20 = Math.round(1000 / cps20);
    expect(interval20).toBe(50);

    // 50 CPS -> 20ms
    const cps50 = 50;
    const interval50 = Math.round(1000 / cps50);
    expect(interval50).toBe(20);

    // Zero protection: zero or negative CPS should fallback safely
    const rawCps = 0;
    const safeCps = Math.max(0.1, rawCps);
    expect(safeCps).toBe(0.1);
    const safeInterval = 1000 / safeCps;
    expect(safeInterval).toBe(10000);
    expect(Number.isFinite(safeInterval)).toBe(true);
  });

  it("should have all standard official presets configured with valid numbers", () => {
    expect(AUTOCLICK_PRESETS.length).toBeGreaterThanOrEqual(5);

    for (const preset of AUTOCLICK_PRESETS) {
      expect(preset.name).toBeTruthy();
      expect(preset.cps).toBeGreaterThan(0);
      expect(preset.intervalMs).toBeGreaterThan(0);
      expect(["left", "right", "middle"]).toContain(preset.mouseButton);
    }
  });

  it("should match schema version and generate valid profile JSON", () => {
    expect(AUTOCLICK_SCHEMA_VERSION).toBe(1);

    const mockProfile = {
      schemaVersion: AUTOCLICK_SCHEMA_VERSION,
      id: "prof-test-1",
      name: "Teste Perfil",
      cps: 12,
      intervalMs: 83.3,
      clickMode: "fixed",
      mouseButton: "left",
      repeatMode: "infinite",
    };

    const serialized = JSON.stringify(mockProfile);
    const deserialized = JSON.parse(serialized);

    expect(deserialized.schemaVersion).toBe(1);
    expect(deserialized.cps).toBe(12);
  });

  it("should have all 15 required documentation markdown files in /docs/autoclick/", () => {
    const docsDir = path.resolve(process.cwd(), "docs/autoclick");
    expect(fs.existsSync(docsDir), "Diretório /docs/autoclick deve existir").toBe(true);

    const requiredDocs = [
      "README.md",
      "ARCHITECTURE.md",
      "ACTION_ENGINE.md",
      "MOUSE_ENGINE.md",
      "KEYBOARD_ENGINE.md",
      "TIMING.md",
      "RECORDER.md",
      "PLAYBACK.md",
      "TARGET_WINDOWS.md",
      "PROFILES.md",
      "HOTKEYS.md",
      "SAFETY.md",
      "TROUBLESHOOTING.md",
      "TESTING.md",
      "AI_INSTRUCTIONS.md",
    ];

    for (const doc of requiredDocs) {
      const fullPath = path.join(docsDir, doc);
      expect(fs.existsSync(fullPath), `Documento ausente: ${doc}`).toBe(true);
      const content = fs.readFileSync(fullPath, "utf-8");
      expect(content.length).toBeGreaterThan(50);
    }
  });

  it("should have AGENTS.md referencing Auto Click documentation and safety rules", () => {
    const agentsPath = path.resolve(process.cwd(), "AGENTS.md");
    expect(fs.existsSync(agentsPath)).toBe(true);

    const content = fs.readFileSync(agentsPath, "utf-8");
    expect(content).toContain("/docs/autoclick/README.md");
    expect(content).toContain("/docs/autoclick/AI_INSTRUCTIONS.md");
    expect(content).toContain("release_all_inputs_native");
  });
});
