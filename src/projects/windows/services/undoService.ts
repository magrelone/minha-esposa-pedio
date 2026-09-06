import { SystemChangeRecord, CustomizationCategory } from "../types";
import { invoke } from "@tauri-apps/api/core";

const STORAGE_KEY = "pmm_windows_change_history";

class UndoService {
  private history: SystemChangeRecord[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.history = JSON.parse(data);
      }
    } catch {
      this.history = [];
    }
  }

  private saveToStorage() {
    try {
      // Guarda até os últimos 100 eventos de modificação
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history.slice(0, 100)));
      this.notifyListeners();
    } catch {}
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch {}
    });
  }

  public getHistory(): SystemChangeRecord[] {
    return [...this.history];
  }

  public getChangeCount(): number {
    return this.history.filter((c) => c.status === "applied" && c.canUndo).length;
  }

  public recordChange(
    category: CustomizationCategory,
    title: string,
    description: string,
    previousState: any,
    newState: any,
    requiresExplorerRestart: boolean = false
  ): SystemChangeRecord {
    const record: SystemChangeRecord = {
      id: "chg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      category,
      title,
      description,
      timestamp: Date.now(),
      previousState: JSON.parse(JSON.stringify(previousState)),
      newState: JSON.parse(JSON.stringify(newState)),
      status: "applied",
      canUndo: true,
      requiresExplorerRestart,
    };

    this.history.unshift(record);
    this.saveToStorage();
    return record;
  }

  public async undoChange(
    changeId: string,
    applyRevertCallback: (category: CustomizationCategory, previousState: any) => Promise<void> | void
  ): Promise<boolean> {
    const item = this.history.find((c) => c.id === changeId);
    if (!item || item.status === "reverted") return false;

    try {
      await applyRevertCallback(item.category, item.previousState);
      item.status = "reverted";
      this.saveToStorage();

      if (item.requiresExplorerRestart) {
        try {
          await invoke("windows_safe_restart_explorer");
        } catch {}
      }

      return true;
    } catch (e) {
      console.error("Falha ao reverter alteração:", e);
      return false;
    }
  }

  public async undoLastChange(
    applyRevertCallback: (category: CustomizationCategory, previousState: any) => Promise<void> | void
  ): Promise<SystemChangeRecord | null> {
    const lastActive = this.history.find((c) => c.status === "applied" && c.canUndo);
    if (!lastActive) return null;

    const success = await this.undoChange(lastActive.id, applyRevertCallback);
    return success ? lastActive : null;
  }

  public clearHistory() {
    this.history = [];
    this.saveToStorage();
  }
}

export const undoService = new UndoService();
