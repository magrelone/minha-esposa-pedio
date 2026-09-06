import { describe, it, expect } from "vitest";
import { BOT_REGISTRY, getBotDefinition } from "../src/projects/bots/core/BotRegistry";
import { useBotsStore } from "../src/projects/bots/store/botsStore";

describe("Bots Module & Architecture", () => {
  it("should have MM2 Coin Collector properly registered with all capabilities", () => {
    const mm2 = getBotDefinition("roblox-mm2-coin-collector");
    expect(mm2).toBeDefined();
    expect(mm2?.game).toContain("Roblox");
    expect(mm2?.provider).toBe("andrewwongwong/RobloxBot");
    expect(mm2?.capabilities).toContain("vision");
    expect(mm2?.capabilities).toContain("keyboard");
    expect(mm2?.capabilities).toContain("object_detection");
    expect(mm2?.capabilities).toContain("models");
    expect(mm2?.capabilities).toContain("gpu");
    expect(mm2?.supportedModels).toContain("yolo11_roblox_official.pt");
  });

  it("should support bot profiles and allow applying presets", () => {
    const store = useBotsStore.getState();
    expect(store.profiles.length).toBeGreaterThanOrEqual(2);

    const coinOnlyProfile = store.profiles.find((p) => p.id === "mm2-coin-only");
    expect(coinOnlyProfile).toBeDefined();

    if (coinOnlyProfile) {
      store.applyProfile(coinOnlyProfile);
      const updatedConfig = useBotsStore.getState().botConfigs["roblox-mm2-coin-collector"];
      expect(updatedConfig.mode).toBe("coin_only");
    }
  });

  it("should correctly store, filter and clear technical logs", () => {
    const store = useBotsStore.getState();
    store.clearLogs();
    expect(useBotsStore.getState().logs.length).toBe(0);

    store.addLog("info", "Bot acordou 🧸");
    store.addLog("vision", "Objeto detectado: Moeda Normal");
    store.addLog("movement", "Caminhando para moeda em (0.45, 0.60)");

    const logs = useBotsStore.getState().logs;
    expect(logs.length).toBe(3);
    expect(logs[0].message).toContain("Bot acordou");
    expect(logs[1].level).toBe("vision");
    expect(logs[2].level).toBe("movement");
  });

  it("should allow updating real-time telemetry metrics", () => {
    const store = useBotsStore.getState();
    store.updateRealtimeMetrics({
      fpsCapture: 30.5,
      fpsInference: 24.2,
      detectedCoins: 3,
      detectedPlayers: 1,
      lastAction: "Coletando moeda",
    });

    const state = useBotsStore.getState();
    expect(state.fpsCapture).toBe(30.5);
    expect(state.fpsInference).toBe(24.2);
    expect(state.detectedCoins).toBe(3);
    expect(state.detectedPlayers).toBe(1);
    expect(state.lastAction).toBe("Coletando moeda");
  });
});
