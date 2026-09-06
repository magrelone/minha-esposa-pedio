import { invoke } from "@tauri-apps/api/core";

export class HotkeyService {
  private static registeredKeys = new Set<string>();

  static async register(keyCombination: string, _callback?: () => void): Promise<boolean> {
    const normalized = keyCombination.trim().toUpperCase();
    if (this.registeredKeys.has(normalized)) {
      console.warn(`[HotkeyService] Atalho ${normalized} já registrado.`);
    }

    try {
      await invoke("register_custom_hotkey", { key: normalized });
      this.registeredKeys.add(normalized);
      return true;
    } catch (e) {
      console.warn("[HotkeyService] Erro ao registrar atalho nativo:", e);
      this.registeredKeys.add(normalized);
      return false;
    }
  }

  static isConflict(keyCombination: string): boolean {
    const normalized = keyCombination.trim().toUpperCase();
    return this.registeredKeys.has(normalized);
  }

  static getRegistered(): string[] {
    return Array.from(this.registeredKeys);
  }
}
