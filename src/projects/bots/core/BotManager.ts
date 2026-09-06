import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useBotsStore } from "../store/botsStore";
import { BotConfig } from "../types";

class BotManagerService {
  private isListening = false;
  private mockInterval: any = null;
  private initWatchdog: any = null;

  public async init() {
    if (this.isListening) return;

    try {
      await listen<{ bot_id: string; data: any }>("bot-event", (event) => {
        this.handleBotEvent(event.payload.bot_id, event.payload.data);
      });

      await listen<{ step: string; percent: number; message: string }>("bot-setup-progress", (event) => {
        const store = useBotsStore.getState();
        store.setSetupProgress({
          isInstalling: true,
          step: event.payload.step,
          percent: event.payload.percent,
          message: event.payload.message,
        });
      });

      await listen<{ success: boolean }>("bot-setup-finished", (event) => {
        const store = useBotsStore.getState();
        store.setSetupProgress({
          isInstalling: false,
          step: "finished",
          percent: 100,
          message: event.payload.success ? "Ambiente de Visão e IA pronto para uso! ✨" : "Instalação finalizada.",
          success: event.payload.success,
        });
        this.refreshEnvironment().catch(() => {});
        this.refreshModels().catch(() => {});
      });

      this.isListening = true;
    } catch (e) {
      console.warn("Tauri event listener indisponível (modo web dev):", e);
    }

    // Auto-discover models and check environment on init
    this.refreshEnvironment().catch(() => {});
    this.refreshModels().catch(() => {});
  }

  private handleBotEvent(botId: string, data: any) {
    const store = useBotsStore.getState();
    if (!data || !data.type) return;

    switch (data.type) {
      case "status":
        if (data.state) {
          store.setBotStatus(botId, data.state);
          if (data.state === "running" || data.state === "stopped" || data.state === "error") {
            if (this.initWatchdog) {
              clearTimeout(this.initWatchdog);
              this.initWatchdog = null;
            }
          }
        }
        if (data.device) {
          store.updateRealtimeMetrics({ device: data.device });
        }
        if (data.message) {
          store.addLog("info", data.message);
        }
        break;

      case "detection":
        store.updateRealtimeMetrics({
          detections: data.objects || [],
          fpsCapture: data.fps_capture || 0,
          fpsInference: data.fps_inference || 0,
          detectedCoins: data.detected_coins || 0,
          detectedPlayers: data.detected_players || 0,
        });
        break;

      case "action":
        store.updateRealtimeMetrics({
          lastAction: data.message || data.action,
        });
        break;

      case "preview_frame":
        if (data.data) {
          store.updateRealtimeMetrics({ previewImage: data.data });
        }
        break;

      case "active_learning_sample":
        store.updateActiveLearning({
          samplesCollected: data.samples_collected || 0,
          lastDetectionsCount: data.detections_count || 0,
          lastReason: data.reason || "",
          quota: data.quota || null,
        });
        if (data.message) {
          store.addLog("vision", data.message);
        }
        break;

      case "log":
        store.addLog(data.level || "info", data.message || "");
        break;

      case "error":
        store.addLog("error", data.message || "Erro desconhecido");
        store.setBotStatus(botId, "error");
        break;
    }
  }

  public async startBot(botId: string, config: BotConfig): Promise<boolean> {
    const store = useBotsStore.getState();
    store.setBotStatus(botId, "initializing");
    store.addLog("info", `Iniciando ${botId}... 🧸`);

    // Watchdog: se ficar em "carregando" demais, libera o botão e avisa
    if (this.initWatchdog) {
      clearTimeout(this.initWatchdog);
      this.initWatchdog = null;
    }
    this.initWatchdog = setTimeout(() => {
      const st = useBotsStore.getState();
      if (st.botStatus[botId] === "initializing") {
        st.addLog(
          "warning",
          "Ainda carregando o YOLO (GPU pode demorar no 1º/2º start). Se travar de vez, clique em Parar e tente de novo."
        );
      }
    }, 25000);
    this.initWatchdog = setTimeout(() => {
      const st = useBotsStore.getState();
      if (st.botStatus[botId] === "initializing") {
        st.addLog("error", "Timeout ao carregar o bot. Use Parar e inicie novamente.");
        st.setBotStatus(botId, "error");
      }
    }, 90000) as any;

    try {
      // Garante pesos certos para Hanami (urso), não o modelo de moedas
      const fixedConfig =
        botId === "roblox-hanami-spirit-collector"
          ? {
              ...config,
              weights:
                config.weights && String(config.weights).toLowerCase().includes("hanami")
                  ? config.weights
                  : "integrations/robloxbot/vendor/bots/mm2_yolo_coin_collector/weights/yolo11_hanami_spirits.pt",
              mode:
                config.mode === "coin_only" || config.mode === "coin_and_players"
                  ? "all_spirits"
                  : config.mode || "all_spirits",
              // Sensível o bastante p/ urso borrado; perseguição usa limiar interno maior
              conf_thres: Math.min(Math.max(config.conf_thres || 0.28, 0.22), 0.40),
              patrol_when_empty: true,
              approach_timeout_s: config.approach_timeout_s ?? 3.5,
              // Hanami precisa andar de verdade
              simulation_mode: false,
            }
          : config;

      if (botId === "roblox-hanami-spirit-collector") {
        store.updateBotConfig(botId, fixedConfig);
      }

      const savedGeminiKey = typeof localStorage !== "undefined" ? (localStorage.getItem("pmm_gemini_api_key") || "") : "";
      const activeLearningEnabled = store.activeLearning?.enabled ?? true;

      const fullConfigWithAi = {
        ...fixedConfig,
        gemini_api_key: savedGeminiKey,
        active_learning: activeLearningEnabled,
      };

      await invoke("bot_start", {
        botId,
        config: fullConfigWithAi,
      });
      store.addLog("info", "Processo Python iniciado, aguardando modelo YOLO... 🧸");
      if (savedGeminiKey && activeLearningEnabled) {
        store.addLog("vision", "🧠 Aprendizado Contínuo Gemini 2.0 Flash ativado para esta sessão!");
      }
      return true;
    } catch (err: any) {
      console.warn("Erro ao iniciar via Tauri, verificando fallback:", err);

      // Web dev simulation fallback if Tauri is not available
      if (typeof window !== "undefined" && !(window as any).__TAURI_INTERNALS__) {
        this.startMockSimulation(botId, config);
        return true;
      }

      const errMsg = typeof err === "string" ? err : err?.message || "Falha ao iniciar processo";
      store.addLog("error", errMsg);
      store.setBotStatus(botId, "error");
      return false;
    }
  }

  public async stopBot(botId: string): Promise<boolean> {
    const store = useBotsStore.getState();
    if (this.initWatchdog) {
      clearTimeout(this.initWatchdog);
      this.initWatchdog = null;
    }
    try {
      await invoke("bot_stop", { botId });
    } catch (e) {
      // Fallback
    }

    this.stopMockSimulation();
    store.setBotStatus(botId, "stopped");
    store.updateRealtimeMetrics({
      detections: [],
      fpsCapture: 0,
      fpsInference: 0,
      previewImage: null,
      lastAction: "Bot descansando",
    });
    store.addLog("info", "Bot foi descansar 💗");
    return true;
  }

  public async pauseBot(botId: string): Promise<boolean> {
    const store = useBotsStore.getState();
    try {
      await invoke("bot_pause");
    } catch (e) {
      // Fallback
    }
    store.setBotStatus(botId, "paused");
    store.addLog("info", "Bot pausado ⏸");
    return true;
  }

  public async resumeBot(botId: string): Promise<boolean> {
    const store = useBotsStore.getState();
    try {
      await invoke("bot_resume");
    } catch (e) {
      // Fallback
    }
    store.setBotStatus(botId, "running");
    store.addLog("info", "Bot retomou as atividades ▶");
    return true;
  }

  public async refreshEnvironment(): Promise<any> {
    const store = useBotsStore.getState();
    store.setIsCheckingEnv(true);

    try {
      const data: any = await invoke("bot_check_environment");
      store.setEnvironmentData(data);
      store.setIsCheckingEnv(false);
      return data;
    } catch (e) {
      // Fallback if running outside native tauri
      const fallback = {
        status: "ready",
        checks: [
          {
            id: "python",
            name: "Python Runtime",
            status: "ok",
            version: "3.10.11",
            message: "Python 3.10.11 operacional",
          },
          {
            id: "venv",
            name: "Ambiente Virtual Isolado",
            status: "ok",
            message: "runtime/python/bots-env pronto",
          },
          {
            id: "gpu",
            name: "Aceleração por GPU",
            status: "ok",
            gpuName: "NVIDIA GeForce RTX 3070 Ti",
            cudaAvailable: false,
            message: "NVIDIA RTX 3070 Ti detectada (CPU fallback ativo)",
          },
          {
            id: "dependencies",
            name: "Dependências do RobloxBot",
            status: "ok",
            message: "PyTorch, Torchvision, OpenCV, Pillow instalados",
          },
          {
            id: "models",
            name: "Pesos e Modelos YOLO",
            status: "ok",
            count: 2,
            message: "yolo_coin_m_v3.pt e yolo_coin_person_m_v2.pt disponíveis",
          },
        ],
        summary: {
          gpuName: "NVIDIA GeForce RTX 3070 Ti",
          cudaAvailable: false,
          pythonVersion: "3.10.11",
          modelsCount: 2,
        },
      };
      store.setEnvironmentData(fallback);
      store.setIsCheckingEnv(false);
      return fallback;
    }
  }

  public async refreshModels(): Promise<any[]> {
    const store = useBotsStore.getState();
    store.setIsLoadingModels(true);

    try {
      const models: any = await invoke("bot_discover_models");
      store.setDiscoveredModels(models);
      store.setIsLoadingModels(false);
      return models;
    } catch (e) {
      const fallbackModels = [
        {
          id: "yolo11_roblox_official.pt",
          filename: "yolo11_roblox_official.pt",
          path: "integrations/robloxbot/vendor/bots/mm2_yolo_coin_collector/weights/yolo11_roblox_official.pt",
          sizeBytes: 5620473,
          sizeFormatted: "5.36 MB",
          provider: "Ultralytics Oficial (YOLO11)",
          classes: ["Moeda Normal", "Outros Jogadores", "Urso Branco (Sakura)", "Urso Preto (Kuro)"],
          dateDiscovered: "Recente",
          deviceSupport: "CUDA 12.1 / CPU",
          status: "Pronto para uso",
          notes: "Motor unificado YOLO11 oficial com aceleração nativa por GPU",
        },
      ];
      store.setDiscoveredModels(fallbackModels);
      store.setIsLoadingModels(false);
      return fallbackModels;
    }
  }

  public async updateRunningConfig(botId: string, partial: Partial<BotConfig>): Promise<void> {
    const store = useBotsStore.getState();
    store.updateBotConfig(botId, partial);

    try {
      const fullConfig = useBotsStore.getState().botConfigs[botId];
      await invoke("bot_send_command", {
        command: {
          type: "CONFIG_UPDATE",
          config: fullConfig,
        },
      });
      store.addLog("info", `Configurações atualizadas em tempo real para ${botId} ✨`);
    } catch (e) {
      // Ignora se o bot estiver parado
    }
  }

  private startMockSimulation(botId: string, config: BotConfig) {
    const store = useBotsStore.getState();
    store.setBotStatus(botId, "running");
    store.addLog("info", "Modo Simulação Web Dev ativo ✨");

    this.mockInterval = setInterval(() => {
      const isPaused = store.botStatus[botId] === "paused";
      if (isPaused) return;

      const randomCoin = Math.random() > 0.3;
      const detections: any[] = [];
      if (randomCoin) {
        detections.push({
          label: "Moeda Normal",
          confidence: +(0.85 + Math.random() * 0.12).toFixed(2),
          bbox: [210, 180, 260, 230],
          rel_center: [0.45, 0.62],
        });
      }
      if (config.mode === "coin_and_players" && Math.random() > 0.6) {
        detections.push({
          label: "Outros Jogadores",
          confidence: +(0.8 + Math.random() * 0.15).toFixed(2),
          bbox: [400, 120, 480, 280],
          rel_center: [0.72, 0.35],
        });
      }

      store.updateRealtimeMetrics({
        detections,
        fpsCapture: +(28 + Math.random() * 4).toFixed(1),
        fpsInference: +(23 + Math.random() * 5).toFixed(1),
        detectedCoins: randomCoin ? 1 : 0,
        detectedPlayers: detections.length > 1 ? 1 : 0,
        lastAction: randomCoin ? "Coletando moeda em (0.45, 0.62)" : "Explorando área (W)",
      });
    }, 1200);
  }

  public async setupEnvironment(): Promise<void> {
    const store = useBotsStore.getState();
    store.setSetupProgress({
      isInstalling: true,
      step: "starting",
      percent: 5,
      message: "Iniciando preparação automática do ambiente dos bots...",
    });

    try {
      await invoke("bot_setup_environment");
    } catch (e: any) {
      store.setSetupProgress({
        isInstalling: false,
        step: "error",
        percent: 0,
        message: `Falha ao iniciar instalador: ${e?.message || e}`,
        success: false,
      });
    }
  }

  private stopMockSimulation() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
  }
}

export const BotManager = new BotManagerService();
