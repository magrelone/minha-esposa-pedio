import sys
import json
import ctypes
import ctypes.wintypes

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

user32 = ctypes.windll.user32

# 1. Anexar à WinSta0
try:
    hwinsta = user32.OpenWindowStationW("WinSta0", False, 0x037F)
    if hwinsta:
        user32.SetProcessWindowStation(hwinsta)
    hdesk = user32.OpenDesktopW("Default", 0, False, 0x01FF)
    if hdesk:
        user32.SetThreadDesktop(hdesk)
except Exception:
    pass

# 2. Listar Monitores Reais
monitors = []
try:
    import mss
    with mss.mss() as sct:
        # mss monitor 0 é a soma de todos; 1, 2, ... são os monitores físicos
        real_mons = sct.monitors[1:] if len(sct.monitors) > 1 else sct.monitors
        for idx, m in enumerate(real_mons):
            monitors.append({
                "id": idx,
                "name": f"Monitor {idx + 1}" + (" (Principal)" if m.get("is_primary") or idx == 0 else ""),
                "width": m["width"],
                "height": m["height"],
                "left": m["left"],
                "top": m["top"],
                "is_primary": m.get("is_primary", idx == 0)
            })
except Exception:
    # Fallback
    w = user32.GetSystemMetrics(0)
    h = user32.GetSystemMetrics(1)
    monitors.append({"id": 0, "name": "Monitor 1 (Principal)", "width": w, "height": h, "is_primary": True})

# 3. Listar Janelas Reais Abertas
windows = []
ignored_titles = [
    "program manager", "default ime", "msctfime ui", "settings", "start",
    "nvidia geforce overlay", "windows input experience"
]

def enum_cb(hwnd, _):
    if user32.IsWindowVisible(hwnd):
        length = user32.GetWindowTextLengthW(hwnd)
        if length > 0:
            buff = ctypes.create_unicode_buffer(length + 1)
            user32.GetWindowTextW(hwnd, buff, length + 1)
            title = buff.value.strip()

            if title and title.lower() not in ignored_titles:
                rect = ctypes.wintypes.RECT()
                user32.GetWindowRect(hwnd, ctypes.byref(rect))
                w = rect.right - rect.left
                h = rect.bottom - rect.top

                # Apenas janelas visíveis com dimensões reais
                if w > 120 and h > 120:
                    is_roblox = "roblox" in title.lower()
                    is_game = is_roblox or any(g in title.lower() for g in ["steam", "epic", "minecraft", "game"])
                    windows.append({
                        "hwnd": hwnd,
                        "title": title,
                        "width": w,
                        "height": h,
                        "is_roblox": is_roblox,
                        "is_game": is_game,
                        "category": "Jogo" if is_game else "Aplicativo"
                    })

user32.EnumWindows(ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)(enum_cb), 0)

# Ordenar com Roblox e jogos primeiro
windows.sort(key=lambda x: (not x["is_roblox"], not x["is_game"], -x["width"] * x["height"]))

result = {
    "monitors": monitors,
    "windows": windows
}

print(json.dumps(result, ensure_ascii=False, indent=2))
