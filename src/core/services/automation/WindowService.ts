import { invoke } from "@tauri-apps/api/core";

export interface WindowEntry {
  hwnd: number;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  is_minimized: boolean;
}

export class WindowService {
  static async getOpenWindows(): Promise<WindowEntry[]> {
    try {
      return await invoke<WindowEntry[]>("autoclick_get_windows");
    } catch (e) {
      // Dev web fallback mock
      return [
        { hwnd: 101, title: "Roblox", x: 100, y: 100, width: 1280, height: 720, is_minimized: false },
        { hwnd: 102, title: "Navegador Web", x: 200, y: 150, width: 1440, height: 900, is_minimized: false },
      ];
    }
  }

  static toAbsolute(win: WindowEntry, relX: number, relY: number): { x: number; y: number } {
    return {
      x: win.x + relX,
      y: win.y + relY,
    };
  }

  static fromPercentage(win: WindowEntry, pctX: number, pctY: number): { x: number; y: number } {
    return {
      x: Math.round(win.x + (win.width * pctX) / 100),
      y: Math.round(win.y + (win.height * pctY) / 100),
    };
  }
}
