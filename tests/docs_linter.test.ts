import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Documentation Linter & Consistency Validator", () => {
  const docsDir = path.resolve(process.cwd(), "docs/bots");

  it("should have all required documentation markdown files present", () => {
    const requiredDocs = [
      "README.md",
      "INDEX.md",
      "ARCHITECTURE.md",
      "CREATING_A_BOT.md",
      "BOT_MANIFEST.md",
      "BOT_LIFECYCLE.md",
      "VISION_ENGINE.md",
      "YOLO_TRAINING.md",
      "DATASETS.md",
      "ANNOTATIONS.md",
      "MODELS.md",
      "CAPTURE_ENGINE.md",
      "INPUT_ENGINE.md",
      "NAVIGATION.md",
      "DECISION_ENGINE.md",
      "CONFIGURATION.md",
      "DEBUGGING.md",
      "TESTING.md",
      "PERFORMANCE.md",
      "GPU.md",
      "ADDING_NEW_GAMES.md",
      "AI_INSTRUCTIONS.md",
      "BOT_CATALOG.md",
      "MODEL_CATALOG.md",
      "DATASET_CATALOG.md",
      "EXAMPLES.md",
    ];

    for (const doc of requiredDocs) {
      const fullPath = path.join(docsDir, doc);
      expect(fs.existsSync(fullPath), `Documento ausente: ${doc}`).toBe(true);
    }
  });

  it("should have valid index.json matching the markdown files", () => {
    const indexPath = path.join(docsDir, "index.json");
    expect(fs.existsSync(indexPath)).toBe(true);

    const content = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
    expect(content.documents.aiInstructions).toBe("/docs/bots/AI_INSTRUCTIONS.md");
    expect(content.documents.architecture).toBe("/docs/bots/ARCHITECTURE.md");
  });

  it("should have root AGENTS.md referencing /docs/bots/INDEX.md", () => {
    const agentsPath = path.resolve(process.cwd(), "AGENTS.md");
    expect(fs.existsSync(agentsPath)).toBe(true);

    const content = fs.readFileSync(agentsPath, "utf-8");
    expect(content).toContain("INDEX.md");
    expect(content).toContain("AI_INSTRUCTIONS.md");
  });

  it("should have MM2 Coin Collector with bot.json and README.md", () => {
    const botDir = path.resolve(process.cwd(), "bots/roblox/mm2_coin_collector");
    expect(fs.existsSync(path.join(botDir, "bot.json"))).toBe(true);
    expect(fs.existsSync(path.join(botDir, "README.md"))).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(path.join(botDir, "bot.json"), "utf-8"));
    expect(manifest.id).toBe("roblox.mm2.coin-collector");
    expect(manifest.capabilities).toContain("object_detection");
  });

  it("should have the vision-bot template ready for scaffolding", () => {
    const templateDir = path.resolve(process.cwd(), "bot-templates/vision-bot");
    expect(fs.existsSync(path.join(templateDir, "bot.json"))).toBe(true);
    expect(fs.existsSync(path.join(templateDir, "main.py"))).toBe(true);
    expect(fs.existsSync(path.join(templateDir, "strategy.py"))).toBe(true);
  });
});
