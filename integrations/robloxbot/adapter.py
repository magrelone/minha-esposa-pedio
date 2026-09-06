import sys
import os

# Enforce UTF-8 stdio on Windows to preserve emojis and special characters cleanly
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
        sys.stdin.reconfigure(encoding="utf-8")
    except Exception:
        pass

import json
import time
import math
import base64
import random
import threading
from pathlib import Path

# Path setup
BASE_DIR = Path(__file__).resolve().parent
VENDOR_DIR = BASE_DIR / "vendor"

PROJECT_ROOT = BASE_DIR.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

try:
    from sdk.bot_sdk.active_learning import ActiveLearningManager
except Exception as e:
    ActiveLearningManager = None

# Global state
running = False
paused = False
active_learner = None
config = {
    "weights": str(VENDOR_DIR / "bots" / "mm2_yolo_coin_collector" / "weights" / "yolo11_roblox_official.pt"),
    "device": "auto",
    "conf_thres": 0.25,
    "iou_thres": 0.45,
    "simulation_mode": False,  # Modo ativo por padrão para executar ações físicas
    "send_preview": True,
    "preview_fps": 6,
    "mode": "coin_only", # "coin_only" or "coin_and_players"
    "jump_prob": 0.1,
    "capture_mode": "auto", # "auto", "window", "region", "fullscreen"
    "region": None, # [x, y, w, h]
    "window_title": "Roblox",
}

def emit(msg_type, **kwargs):
    payload = {"type": msg_type, **kwargs}
    try:
        sys.stdout.write(json.dumps(payload, ensure_ascii=False) + "\n")
        sys.stdout.flush()
    except Exception:
        pass

def log(level, message):
    emit("log", level=level, message=message, time=time.strftime("%H:%M:%S"))

def setup_active_learning(cfg):
    global active_learner
    if not ActiveLearningManager:
        return None

    if not cfg.get("active_learning", True):
        return None

    api_key = cfg.get("gemini_api_key") or os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        return None

    try:
        if "hanami" in str(cfg.get("bot_id", "")).lower():
            target_desc = (
                "espíritos em formato de gatinhos fofos 3D que flutuam no ar e giram continuamente no Roblox: "
                "1) Gatinho branco perolado com olhos cósmicos roxos/azuis e flor sakura na cauda, flutuando e girando no ar. "
                "2) Gatinho preto aveludado com orelhas e olhos rosa/lavanda luminosos, flutuando e girando no ar. "
                "NÃO detectar avatares de jogadores em pé (@Nome flutuante). "
                "NÃO detectar o cursor do mouse pixel-art."
            )
            class_name = "spirit"
        else:
            target_desc = "moedas ou itens colecionáveis"
            class_name = "coin"

        active_learner = ActiveLearningManager(
            api_key=api_key,
            min_interval_seconds=10.0,
            target_description=target_desc,
            class_name=class_name
        )
        active_learner.set_emit_callback(emit)
        active_learner.start()
        log("vision", f"🧠 Aprendizado Contínuo Gemini 2.0 Flash ativado ({active_learner.samples_collected} amostras prévias salvas em disco)!")
        return active_learner
    except Exception as e:
        log("warning", f"Não foi possível iniciar Active Learning: {e}")
        return None

def stop_active_learning():
    global active_learner
    if active_learner:
        try:
            active_learner.stop()
        except Exception:
            pass
        active_learner = None

# ====================================================================
# DirectInput Hardware Scancode Driver (Roblox & DirectX Compatible)
# ====================================================================
SCANCODES = {
    "w": 0x11,
    "a": 0x1E,
    "s": 0x1F,
    "d": 0x20,
    "space": 0x39,
    "e": 0x12,
    "shift": 0x2A,
    "left": 0x4B,
    "right": 0x4D,
    "up": 0x48,
    "down": 0x50,
}

VK_CODES = {
    "w": 0x57,
    "a": 0x41,
    "s": 0x53,
    "d": 0x44,
    "space": 0x20,
    "e": 0x45,
    "shift": 0x10,
    "left": 0x25,
    "right": 0x27,
    "up": 0x26,
    "down": 0x28,
}

if sys.platform == "win32":
    import ctypes
    from ctypes import wintypes

    ULONG_PTR = ctypes.c_ulonglong if ctypes.sizeof(ctypes.c_void_p) == 8 else ctypes.c_ulong

    class KEYBDINPUT(ctypes.Structure):
        _fields_ = [
            ("wVk", wintypes.WORD),
            ("wScan", wintypes.WORD),
            ("dwFlags", wintypes.DWORD),
            ("time", wintypes.DWORD),
            ("dwExtraInfo", ULONG_PTR),
        ]

    class MOUSEINPUT(ctypes.Structure):
        _fields_ = [
            ("dx", wintypes.LONG),
            ("dy", wintypes.LONG),
            ("mouseData", wintypes.DWORD),
            ("dwFlags", wintypes.DWORD),
            ("time", wintypes.DWORD),
            ("dwExtraInfo", ULONG_PTR),
        ]

    class HARDWAREINPUT(ctypes.Structure):
        _fields_ = [
            ("uMsg", wintypes.DWORD),
            ("wParamL", wintypes.WORD),
            ("wParamH", wintypes.WORD),
        ]

    class INPUT_UNION(ctypes.Union):
        _fields_ = [("ki", KEYBDINPUT), ("mi", MOUSEINPUT), ("hi", HARDWAREINPUT)]

    class INPUT(ctypes.Structure):
        _fields_ = [("type", wintypes.DWORD), ("union", INPUT_UNION)]

class HardwareInputController:
    def __init__(self):
        self.active_keys = set()
        self.user32 = None
        self._last_focus_try = 0.0
        self._keys_sent_ok = 0
        self._keys_sent_fail = 0
        if sys.platform == "win32":
            try:
                import ctypes
                self.user32 = ctypes.windll.user32
            except Exception:
                self.user32 = None

        self.pynput_kb = None
        try:
            from pynput.keyboard import Controller
            self.pynput_kb = Controller()
        except Exception:
            pass

    def _send_scancode(self, char, key_up=False):
        if not self.user32 or char not in SCANCODES:
            return False
        try:
            import ctypes
            sc = SCANCODES[char]
            flags = 0x0008  # KEYEVENTF_SCANCODE
            if key_up:
                flags |= 0x0002  # KEYEVENTF_KEYUP
            inp = INPUT(
                type=1,
                union=INPUT_UNION(
                    ki=KEYBDINPUT(
                        wVk=0,
                        wScan=sc,
                        dwFlags=flags,
                        time=0,
                        dwExtraInfo=0,
                    )
                ),
            )
            sent = self.user32.SendInput(1, ctypes.byref(inp), ctypes.sizeof(INPUT))
            return sent == 1
        except Exception:
            return False

    def _send_vk(self, char, key_up=False):
        if not self.user32 or char not in VK_CODES:
            return False
        try:
            vk = VK_CODES[char]
            flags = 0x0002 if key_up else 0
            # keybd_event é mais tolerante com alguns jogos
            self.user32.keybd_event(vk, SCANCODES.get(char, 0), flags, 0)
            return True
        except Exception:
            return False

    def focus_game_window(self, title_hint="Roblox", force=False):
        """Traz o Roblox para frente — sem foco as teclas não andam o personagem."""
        now = time.time()
        if not force and (now - self._last_focus_try) < 1.5:
            return False
        self._last_focus_try = now
        if not self.user32:
            return False
        hwnd = find_roblox_window(title_hint)
        if not hwnd:
            return False
        try:
            import ctypes
            user32 = self.user32
            # Restaura se minimizado
            if user32.IsIconic(hwnd):
                user32.ShowWindow(hwnd, 9)  # SW_RESTORE
            fg = user32.GetForegroundWindow()
            if fg == hwnd:
                return True
            # Truque AttachThreadInput para SetForegroundWindow funcionar no Windows
            current = user32.GetCurrentThreadId()
            fg_tid = user32.GetWindowThreadProcessId(fg, None)
            target_tid = user32.GetWindowThreadProcessId(hwnd, None)
            user32.AttachThreadInput(current, fg_tid, True)
            user32.AttachThreadInput(current, target_tid, True)
            user32.BringWindowToTop(hwnd)
            user32.SetForegroundWindow(hwnd)
            user32.AttachThreadInput(current, fg_tid, False)
            user32.AttachThreadInput(current, target_tid, False)
            return True
        except Exception:
            try:
                self.user32.SetForegroundWindow(hwnd)
                return True
            except Exception:
                return False

    def press_key(self, char, simulation=False, refresh=False):
        if simulation:
            return
        char = char.lower()
        already = char in self.active_keys
        if already and not refresh:
            return

        self.active_keys.add(char)
        ok = self._send_scancode(char, key_up=False)
        if not ok:
            ok = self._send_vk(char, key_up=False)
        if not ok and self.pynput_kb:
            try:
                self.pynput_kb.press(char if char != "space" else " ")
                ok = True
            except Exception:
                ok = False
        if ok:
            self._keys_sent_ok += 1
        else:
            self._keys_sent_fail += 1

    def release_key(self, char, simulation=False):
        char = char.lower()
        if char in self.active_keys:
            self.active_keys.remove(char)
        if simulation:
            return

        ok = self._send_scancode(char, key_up=True)
        if not ok:
            ok = self._send_vk(char, key_up=True)
        if not ok and self.pynput_kb:
            try:
                self.pynput_kb.release(char if char != "space" else " ")
            except Exception:
                pass

    def hold_keys(self, keys, simulation=False, refresh=False):
        """Mantém exatamente o conjunto de teclas pressionado."""
        keys = [k.lower() for k in keys if k]
        if not keys:
            keys = ["w"]
        for k in list(self.active_keys):
            if k not in keys:
                self.release_key(k, simulation=simulation)
        for k in keys:
            self.press_key(k, simulation=simulation, refresh=refresh)

    def release_all(self):
        for k in list(self.active_keys):
            self.release_key(k, simulation=False)
        self.active_keys.clear()

    def rotate_camera(self, dx_pixels, dy_pixels=0, simulation=False):
        """
        Gira a câmera e a visão do personagem no Roblox.
        Funciona tanto em 1ª Pessoa (mouse lock) quanto em 3ª Pessoa (drag com botão direito)
        e aplica suporte por teclado (setas) se necessário.
        """
        if simulation or not self.user32:
            return
        try:
            dx = int(dx_pixels)
            dy = int(dy_pixels)
            if dx == 0 and dy == 0:
                return

            # Movimento de mouse com botão direito segurado (mecanismo universal de câmera do Roblox)
            # MOUSEEVENTF_RIGHTDOWN = 0x0008, MOUSEEVENTF_MOVE = 0x0001, MOUSEEVENTF_RIGHTUP = 0x0010
            self.user32.mouse_event(0x0008, 0, 0, 0, 0)
            time.sleep(0.003)
            self.user32.mouse_event(0x0001, dx, dy, 0, 0)
            time.sleep(0.003)
            self.user32.mouse_event(0x0010, 0, 0, 0, 0)

            # Para giros grandes, também dá um toque na seta do teclado para garantir rotação do avatar
            if dx > 60:
                self.press_key("right")
                time.sleep(0.02)
                self.release_key("right")
            elif dx < -60:
                self.press_key("left")
                time.sleep(0.02)
                self.release_key("left")
        except Exception:
            pass

input_controller = HardwareInputController()

# Interactive Desktop Attachment & Screen Capture
def ensure_interactive_desktop():
    if sys.platform == "win32":
        try:
            import ctypes
            user32 = ctypes.windll.user32
            hwinsta = user32.OpenWindowStationW("WinSta0", False, 0x037F)
            if hwinsta:
                user32.SetProcessWindowStation(hwinsta)
            hdesk = user32.OpenDesktopW("Default", 0, False, 0x01FF)
            if hdesk:
                user32.SetThreadDesktop(hdesk)
        except Exception:
            pass

_cached_roblox_hwnd = None

def find_roblox_window(title_hint="Roblox"):
    global _cached_roblox_hwnd
    if _cached_roblox_hwnd:
        try:
            import win32gui
            if win32gui.IsWindow(_cached_roblox_hwnd) and win32gui.IsWindowVisible(_cached_roblox_hwnd):
                return _cached_roblox_hwnd
        except Exception:
            pass

    ensure_interactive_desktop()
    _cached_roblox_hwnd = None

    try:
        import win32gui
        hwnd_list = []
        def enum_cb(h, _):
            if win32gui.IsWindowVisible(h):
                txt = win32gui.GetWindowText(h)
                if txt and title_hint.lower() in txt.lower():
                    rect = win32gui.GetWindowRect(h)
                    w = rect[2] - rect[0]
                    h_sz = rect[3] - rect[1]
                    if w > 100 and h_sz > 100:
                        hwnd_list.append((h, w * h_sz))
        win32gui.EnumWindows(enum_cb, None)
        if hwnd_list:
            hwnd_list.sort(key=lambda x: x[1], reverse=True)
            _cached_roblox_hwnd = hwnd_list[0][0]
            return _cached_roblox_hwnd
    except Exception:
        pass
    return None

def capture_frame(cfg):
    ensure_interactive_desktop()
    import numpy as np

    # 1. Captura direta de alta fidelidade via PrintWindow (captura Roblox mesmo sobreposto)
    hwnd = find_roblox_window(cfg.get("window_title", "Roblox"))
    if hwnd:
        try:
            import ctypes
            import ctypes.wintypes
            import struct

            user32 = ctypes.windll.user32
            gdi32 = ctypes.windll.gdi32

            rect = ctypes.wintypes.RECT()
            user32.GetWindowRect(hwnd, ctypes.byref(rect))
            w = rect.right - rect.left
            h = rect.bottom - rect.top

            if w > 50 and h > 50:
                hwnd_dc = user32.GetWindowDC(hwnd)
                mem_dc = gdi32.CreateCompatibleDC(hwnd_dc)
                hbitmap = gdi32.CreateCompatibleBitmap(hwnd_dc, w, h)
                gdi32.SelectObject(mem_dc, hbitmap)

                # PW_RENDERFULLCONTENT = 2
                res = user32.PrintWindow(hwnd, mem_dc, 2)
                if res == 1:
                    bmi = ctypes.create_string_buffer(40)
                    struct.pack_into("<LiiHHLLLLLL", bmi, 0, 40, w, -h, 1, 32, 0, w * h * 4, 0, 0, 0, 0)
                    buf = ctypes.create_string_buffer(w * h * 4)
                    gdi32.GetDIBits(mem_dc, hbitmap, 0, h, buf, bmi, 0)

                    arr = np.frombuffer(buf, dtype=np.uint8).reshape((h, w, 4))
                    rgb = arr[:, :, [2, 1, 0]].copy()

                    gdi32.DeleteObject(hbitmap)
                    gdi32.DeleteDC(mem_dc)
                    user32.ReleaseDC(hwnd, hwnd_dc)

                    region = cfg.get("region")
                    if region and len(region) == 4:
                        rx, ry, rw, rh = region
                        return rgb[ry:ry+rh, rx:rx+rw]

                    return rgb

                gdi32.DeleteObject(hbitmap)
                gdi32.DeleteDC(mem_dc)
                user32.ReleaseDC(hwnd, hwnd_dc)
        except Exception:
            pass

    # 2. Fallback via MSS (Ultra-rápido para desktop)
    try:
        import mss
        with mss.mss() as sct:
            mon = sct.monitors[1] if len(sct.monitors) > 1 else sct.monitors[0]
            region = cfg.get("region")
            if region and len(region) == 4:
                rx, ry, rw, rh = region
                shot = sct.grab({"top": int(ry), "left": int(rx), "width": int(rw), "height": int(rh)})
            else:
                shot = sct.grab(mon)
            arr = np.array(shot)
            return arr[:, :, [2, 1, 0]]
    except Exception:
        pass

    # 3. Fallback via PIL.ImageGrab
    try:
        from PIL import ImageGrab
        region = cfg.get("region")
        if region and len(region) == 4:
            x, y, w, h = region
            img = ImageGrab.grab(bbox=(int(x), int(y), int(x + w), int(y + h)))
        else:
            img = ImageGrab.grab()
        return np.array(img)
    except Exception:
        return None

# ====================================================================
# Ultralytics YOLO11 Oficial (Motor Único e Moderno)
# ====================================================================
def load_yolo_model(weights_path, device_req):
    import torch
    from ultralytics import YOLO

    device_str = "cpu"
    if device_req in ["cuda", "auto"] and torch.cuda.is_available():
        device_str = "cuda:0"
        try:
            # Evita travar no 2º start depois de kill brusco do processo anterior
            torch.cuda.empty_cache()
        except Exception:
            pass

    resolved_path = resolve_weights_file(weights_path)
    log("info", f"Carregando motor Ultralytics YOLO11 Oficial: {Path(resolved_path).name} no dispositivo {device_str.upper()}...")
    emit("status", state="initializing", message=f"Carregando {Path(resolved_path).name}...")
    t0 = time.time()

    yolo_mod = YOLO(resolved_path)
    if device_str.startswith("cuda"):
        try:
            yolo_mod.to(device_str)
        except Exception as e:
            log("warning", f"Falha ao mover modelo para CUDA ({e}); usando CPU")
            device_str = "cpu"

    names = getattr(yolo_mod, "names", {})
    if isinstance(names, dict):
        class_names = [names[k] for k in sorted(names.keys())]
    elif isinstance(names, (list, tuple)):
        class_names = list(names)
    else:
        class_names = ["Moeda Normal", "Outros Jogadores", "Urso Branco (Sakura)", "Urso Preto (Kuro)"]

    elapsed = round(time.time() - t0, 2)
    log("info", f"Ultralytics YOLO11 carregado em {elapsed}s no {device_str.upper()}! Classes: {class_names}")
    return {"type": "ultralytics", "model": yolo_mod, "device": device_str}, device_str, class_names

def run_inference(model_obj, device, img_np, conf_thres=0.25, iou_thres=0.45):
    h0, w0 = img_np.shape[:2]
    yolo_mod = model_obj["model"]
    dev = model_obj.get("device", "cuda:0" if "cuda" in str(device) else "cpu")

    preds = yolo_mod.predict(
        source=img_np,
        device=dev,
        conf=conf_thres,
        iou=iou_thres,
        verbose=False
    )
    results = []
    if preds and len(preds) > 0:
        for box in preds[0].boxes:
            coords = box.xyxy[0].tolist()
            x1, y1, x2, y2 = [float(v) for v in coords]
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            results.append({
                "class_id": cls_id,
                "confidence": round(conf, 3),
                "bbox": [round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)],
                "rel_center": [round(((x1 + x2) / 2) / w0, 3), round(((y1 + y2) / 2) / h0, 3)]
            })
    return results

# ====================================================================
# Policy & Continuous Navigation Engine
# ====================================================================
current_explore_key = "w"
explore_start_time = 0.0
explore_duration = 2.0

def execute_policy(detections, class_names, cfg, img_shape):
    global current_explore_key, explore_start_time, explore_duration

    now = time.time()
    sim_mode = cfg.get("simulation_mode", False)
    mode = cfg.get("mode", "coin_only")
    jump_prob = cfg.get("jump_prob", 0.08)

    coins = []
    players = []

    for d in detections:
        cid = d["class_id"]
        cname = class_names[cid] if cid < len(class_names) else "unknown"
        cname_lower = cname.lower()
        if "person" in cname_lower or "player" in cname_lower or "jogador" in cname_lower:
            players.append(d)
        else:
            coins.append(d)

    xc, yc = 0.5, 0.75
    action_name = "idle"
    keys_pressed = []
    action_msg = "Aguardando objetos na tela"

    # 1. Priorizar desvio de jogadores se habilitado
    if mode == "coin_and_players" and len(players) > 0:
        avg_px = sum(p["rel_center"][0] for p in players) / len(players)
        avg_py = sum(p["rel_center"][1] for p in players) / len(players)
        dx = avg_px - xc
        dy = avg_py - yc

        if dx < 0:
            keys_pressed.append("d")
        elif dx > 0:
            keys_pressed.append("a")
        if dy < 0:
            keys_pressed.append("s")
        elif dy > 0:
            keys_pressed.append("w")

        action_name = "flee_player"
        action_msg = f"Desviando de jogador ({avg_px:.2f}, {avg_py:.2f})"

    # 2. Caminhar em direção a moedas/itens detectados
    elif len(coins) > 0:
        target = min(coins, key=lambda c: (c["rel_center"][0] - xc)**2 + (c["rel_center"][1] - yc)**2)
        tx, ty = target["rel_center"]
        dx = tx - xc
        dy = ty - yc

        # Virar a câmera suavemente em direção ao item detectado
        if abs(dx) > 0.035:
            turn_dx = int(dx * 350)
            turn_dx = max(-160, min(160, turn_dx))
            input_controller.rotate_camera(turn_dx, simulation=sim_mode)

        keys_pressed.append("w")
        if dx > 0.12:
            keys_pressed.append("d")
        elif dx < -0.12:
            keys_pressed.append("a")

        if random.random() < jump_prob:
            keys_pressed.append("space")

        action_name = "collect_coin"
        action_msg = f"Caminhando para moeda em ({tx:.2f}, {ty:.2f}) [Conf: {int(target['confidence']*100)}%]"

    # 3. Navegação e Exploração Ativa Contínua (NUNCA fica parado)
    else:
        if (now - explore_start_time) >= explore_duration:
            explore_start_time = now
            # 65% andar em frente (W), 17% virar esquerda com câmera, 18% virar direita com câmera
            r = random.random()
            if r < 0.65:
                current_explore_key = "w"
                explore_duration = random.uniform(2.0, 3.5)
            elif r < 0.82:
                current_explore_key = "w"
                explore_duration = random.uniform(1.2, 2.0)
                input_controller.rotate_camera(-140, simulation=sim_mode)
            else:
                current_explore_key = "w"
                explore_duration = random.uniform(1.2, 2.0)
                input_controller.rotate_camera(140, simulation=sim_mode)

        for k in current_explore_key.split("+"):
            keys_pressed.append(k)

        if random.random() < jump_prob:
            keys_pressed.append("space")

        action_name = "explore"
        action_msg = f"Patrulhando mapa ativamente ({current_explore_key.upper()})"

    # Sincronização precisa de teclas ativas
    if not sim_mode:
        for k in list(input_controller.active_keys):
            if k not in keys_pressed and k != "space":
                input_controller.release_key(k, simulation=False)
        for k in keys_pressed:
            input_controller.press_key(k, simulation=False)
            if k == "space":
                time.sleep(0.03)
                input_controller.release_key("space", simulation=False)

    return action_name, keys_pressed, action_msg, len(coins), len(players)

def resolve_weights_file(raw_path=""):
    if raw_path:
        p = Path(raw_path)
        if p.exists():
            return str(p.resolve())
        candidate = VENDOR_DIR / "bots" / "mm2_yolo_coin_collector" / "weights" / p.name
        if candidate.exists():
            return str(candidate.resolve())

    # Se for contexto de Hanami
    hanami_pt = VENDOR_DIR / "bots" / "mm2_yolo_coin_collector" / "weights" / "yolo11_hanami_spirits.pt"
    if "hanami" in str(raw_path).lower() and hanami_pt.exists():
        return str(hanami_pt.resolve())

    official_pt = VENDOR_DIR / "bots" / "mm2_yolo_coin_collector" / "weights" / "yolo11_roblox_official.pt"
    if official_pt.exists():
        return str(official_pt.resolve())
    base_pt = VENDOR_DIR / "bots" / "mm2_yolo_coin_collector" / "weights" / "yolo11n_official.pt"
    if base_pt.exists():
        return str(base_pt.resolve())
    return str(official_pt)

# --- Hanami District Autonomous Engine (Patrol, Spirit Tracking & AFK Rest System) ---

HANAMI_DEFAULT_WAYPOINTS = [
    {"id": "spawn_plaza", "name": "Praça Central de Hanami", "direction": "w", "duration_ms": 2500, "description": "Avanço reto pela alameda principal de cerejeiras."},
    {"id": "bamboo_path", "name": "Trilha dos Bambus e Trilhos", "direction": "w+d", "duration_ms": 2000, "description": "Diagonal contornando a linha férrea onde surgem os ursos brancos."},
    {"id": "bridge_crossing", "name": "Ponte Tradicional Japonesa", "direction": "w", "duration_ms": 3000, "description": "Travessia da ponte em direção ao templo sagrado."},
    {"id": "shrine_garden", "name": "Jardim do Templo Secreto", "direction": "w+a", "duration_ms": 2200, "description": "Área de penumbra propícia para spawn dos ursos pretos."},
    {"id": "tea_house", "name": "Casas de Chá de Hanami", "direction": "s+a", "duration_ms": 2500, "description": "Retorno pela lateral das vilas tradicionais."},
    {"id": "back_to_plaza", "name": "Retorno à Praça Central", "direction": "s", "duration_ms": 2800, "description": "Fecha o circuito de volta à praça inicial."}
]

def load_hanami_navmesh():
    nav_file = BASE_DIR.parent.parent / "bots" / "roblox" / "hanami_district_collector" / "hanami_navmesh.json"
    if nav_file.exists():
        try:
            with open(nav_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            log("warning", f"Erro ao carregar navmesh customizado: {e}")
    return None

def load_hanami_waypoints():
    wp_file = BASE_DIR.parent.parent / "bots" / "roblox" / "hanami_district_collector" / "waypoints.json"
    if wp_file.exists():
        try:
            with open(wp_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                if "waypoints" in data and len(data["waypoints"]) > 0:
                    return data["waypoints"]
        except Exception as e:
            log("warning", f"Erro ao carregar waypoints customizados: {e}")
    return HANAMI_DEFAULT_WAYPOINTS

def _is_player_avatar_zone(cx, cy, rel_w=0.0, rel_h=0.0, bbox=None, frame_shape=None):
    """Ignora só o próprio avatar (miolo centro-baixo). Não engole ursos na rua ao lado."""
    # Zona bem estreita: personagem em 3ª pessoa fica no centro
    if 0.38 < cx < 0.62 and cy > 0.55:
        if rel_h >= 0.18 or rel_w >= 0.14 or (rel_w * rel_h) >= 0.035:
            return True
        if 0.42 < cx < 0.58 and cy > 0.60:
            return True

    # Avatar enorme no centro
    if rel_w > 0.25 and rel_h > 0.28 and 0.35 < cx < 0.65 and cy > 0.48:
        return True

    if bbox is not None and 0.40 < cx < 0.60 and cy > 0.52:
        bw = abs(float(bbox[2]) - float(bbox[0]))
        bh = abs(float(bbox[3]) - float(bbox[1]))
        aspect = bw / max(1.0, bh)
        # Personagem em pé bem no centro
        if aspect < 0.70 and rel_h > 0.20:
            return True

    return False


def _looks_like_player_avatar(frame, bbox, kind="black"):
    """Chapéu pontudo preto + corpo alto NO CENTRO = seu personagem, não urso na rua."""
    import cv2
    import numpy as np

    h, w = frame.shape[:2]
    x1, y1, x2, y2 = [int(v) for v in bbox]
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w - 1, max(x1 + 1, x2)), min(h - 1, max(y1 + 1, y2))
    crop = frame[y1:y2, x1:x2]
    if crop.size == 0:
        return False

    bw, bh = x2 - x1, y2 - y1
    aspect = bw / float(max(1, bh))
    cx = ((x1 + x2) / 2.0) / float(w)
    cy = ((y1 + y2) / 2.0) / float(h)

    # Só considera "player" se estiver bem no centro-baixo
    if not (0.38 < cx < 0.62 and cy > 0.50):
        return False

    gray = cv2.cvtColor(crop, cv2.COLOR_RGB2GRAY)
    top = gray[: max(1, bh // 3), :]
    mid = gray[bh // 3: (2 * bh) // 3, :]
    top_luma = float(np.mean(top)) if top.size else 255
    mid_luma = float(np.mean(mid)) if mid.size else 255

    if kind == "black" and aspect < 0.90 and top_luma < 55 and cy > 0.52:
        return True
    if top_luma < 70 and mid.size and cy > 0.55 and aspect < 1.0:
        if float(np.std(mid)) > 45:
            return True
    if kind == "black" and cy > 0.55 and 0.40 < cx < 0.60 and (bw * bh) / float(max(1, w * h)) > 0.05:
        if top_luma < 80 and mid_luma < 120:
            return True
    return False


def _spirit_geometry_ok(bbox, frame_shape, kind="white"):
    """Geometria: gatinhos são compactos e flutuam girando em 3D."""
    h, w = frame_shape[:2]
    x1, y1, x2, y2 = [float(v) for v in bbox]
    bw, bh = max(1.0, abs(x2 - x1)), max(1.0, abs(y2 - y1))
    area_ratio = (bw * bh) / float(max(1, w * h))
    aspect = bw / float(bh)
    # Gatinho girando em 3D em perspectiva tem aspect entre 0.48 e 2.8
    if aspect < 0.48 or aspect > 2.8:
        return False
    # Aceita gatinhos desde pequenos à distância (área ~0.00008) até grandes de perto (área 0.30)
    if area_ratio < 0.00008 or area_ratio > 0.30:
        return False
    return True


def _center_crop_stats(frame, bbox):
    """Estatísticas do miolo do bbox (ignora pétalas na borda)."""
    import cv2
    import numpy as np

    h, w = frame.shape[:2]
    x1, y1, x2, y2 = [int(v) for v in bbox]
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w - 1, max(x1 + 1, x2)), min(h - 1, max(y1 + 1, y2))
    bw, bh = x2 - x1, y2 - y1
    # Miolo central ~50%
    mx1 = x1 + int(bw * 0.20)
    my1 = y1 + int(bh * 0.20)
    mx2 = x2 - int(bw * 0.20)
    my2 = y2 - int(bh * 0.20)
    if mx2 <= mx1 or my2 <= my1:
        mx1, my1, mx2, my2 = x1, y1, x2, y2
    crop = frame[my1:my2, mx1:mx2]
    if crop.size == 0:
        return None
    gray = cv2.cvtColor(crop, cv2.COLOR_RGB2GRAY)
    hsv = cv2.cvtColor(crop, cv2.COLOR_RGB2HSV)
    hch, sch, vch = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    # Rosa/magenta sakura (OpenCV H: ~135-179 e 0-15)
    pink = ((hch >= 135) | (hch <= 15)) & (sch >= 40) & (vch >= 70)
    pink_ratio = float(np.mean(pink.astype(np.float32)))
    return {
        "luma": float(np.mean(gray)),
        "sat": float(np.mean(sch)),
        "val": float(np.mean(vch)),
        "pink_ratio": pink_ratio,
    }


def _white_spirit_ok(frame, bbox):
    """Gatinho branco = glow claro/perolado no miolo, aceitando o tom pastel rosa natural."""
    st = _center_crop_stats(frame, bbox)
    if not st:
        return False
    # Só descarta se for folhagem pura ultra-saturada
    if st["sat"] > 140 and st["pink_ratio"] > 0.60:
        return False
    # Glow / perolado claro
    if st["luma"] < 95:
        return False
    return True


def _black_spirit_ok(frame, bbox):
    """Gatinho preto = miolo aveludado escuro com orelhas e olhos rosa/lavanda luminosos."""
    st = _center_crop_stats(frame, bbox)
    if not st:
        return False
    # Aceita até luma 180 para permitir o brilho das orelhas e olhos luminosos em degradê
    if st["luma"] > 180:
        return False
    if _looks_like_player_avatar(frame, bbox, "black"):
        return False
    if _is_game_mouse_cursor(frame, bbox):
        return False
    return True


_mouse_cursor_template = None
_mouse_cursor_mask = None

def _get_mouse_cursor_template():
    global _mouse_cursor_template, _mouse_cursor_mask
    if _mouse_cursor_template is not None:
        return _mouse_cursor_template, _mouse_cursor_mask
    try:
        import cv2
        for p in [
            Path(__file__).resolve().parent / "assets" / "mouse_cursor_filter.png",
            Path(__file__).resolve().parent.parent.parent / "mouseicom.png",
            Path("mouseicom.png"),
        ]:
            if p.exists():
                rgba = cv2.imread(str(p), cv2.IMREAD_UNCHANGED)
                if rgba is not None and rgba.shape[2] == 4:
                    _mouse_cursor_template = rgba[:, :, :3]
                    _mouse_cursor_mask = rgba[:, :, 3]
                    break
    except Exception:
        pass
    return _mouse_cursor_template, _mouse_cursor_mask


def _is_game_mouse_cursor(frame, bbox, hwnd=None):
    """
    Detecta e descarta o cursor de mouse customizado do jogo.
    O cursor é um gatinho preto pixel-art (Chococat) com balão de estrela amarela na esquerda,
    laço rosa na orelha direita e coração rosa na cabeça.
    Utiliza template matching com mouseicom.png, GetCursorPos e análise de cores HSV.
    """
    try:
        import cv2
        import numpy as np

        h, w = frame.shape[:2]
        x1, y1, x2, y2 = [int(v) for v in bbox]
        bw = max(1, x2 - x1)
        bh = max(1, y2 - y1)

        # 1. Posição física do cursor no Windows (GetCursorPos + ScreenToClient)
        if sys.platform == "win32":
            try:
                import ctypes
                from ctypes import wintypes
                class POINT(ctypes.Structure):
                    _fields_ = [("x", ctypes.c_long), ("y", ctypes.c_long)]
                pt = POINT()
                if ctypes.windll.user32.GetCursorPos(ctypes.byref(pt)):
                    target_h = hwnd or find_roblox_window("Roblox")
                    if target_h:
                        ctypes.windll.user32.ScreenToClient(target_h, ctypes.byref(pt))
                        mx, my = pt.x, pt.y
                        # Se o cursor do Windows estiver sobre ou adjacente (margem 45px) da caixa:
                        if (x1 - 45 <= mx <= x2 + 45) and (y1 - 45 <= my <= y2 + 45):
                            return True
            except Exception:
                pass

        # 2. Template Matching com o ícone exato transparente fornecido pelo usuário (mouseicom.png)
        if 35 <= bw <= 130 and 35 <= bh <= 130:
            tmpl, mask = _get_mouse_cursor_template()
            if tmpl is not None:
                py1 = max(0, y1 - 15)
                py2 = min(h, y2 + 15)
                px1 = max(0, x1 - 15)
                px2 = min(w, x2 + 15)
                area_crop = frame[py1:py2, px1:px2]
                if area_crop.shape[0] >= 65 and area_crop.shape[1] >= 75:
                    res = cv2.matchTemplate(area_crop, tmpl, cv2.TM_SQDIFF_NORMED, mask=mask)
                    min_val, _, _, _ = cv2.minMaxLoc(res)
                    if min_val < 0.22:
                        return True

        # 2. Assinatura Visual do Cursor (Pixel art: tamanho compacto, laço rosa e estrela amarela)
        # O cursor do mouse é pequeno (bw <= 90 e bh <= 100)
        if bw < 90 and bh < 100:
            crop = frame[max(0, y1):min(h, y2), max(0, x1):min(w, x2)]
            if crop.size > 0:
                hsv = cv2.cvtColor(crop, cv2.COLOR_RGB2HSV)
                ch_h, ch_s, ch_v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]

                # Laço rosa na orelha / coração rosa
                pink_bow = ((ch_h >= 135) | (ch_h <= 15)) & (ch_s >= 25) & (ch_v >= 120)
                has_pink = float(np.mean(pink_bow)) > 0.02

                # Estrela amarela pendurada à esquerda
                star_region = hsv[:int(crop.shape[0] * 0.75), :int(crop.shape[1] * 0.55)]
                if star_region.size > 0:
                    sr_h, sr_s, sr_v = star_region[:, :, 0], star_region[:, :, 1], star_region[:, :, 2]
                    yellow_star = (sr_h >= 18) & (sr_h <= 36) & (sr_s >= 30) & (sr_v >= 130)
                    has_star = float(np.mean(yellow_star)) > 0.02
                else:
                    has_star = False

                # Olhos grandes brancos no miolo do rosto
                white_eyes = (ch_s <= 35) & (ch_v >= 200)
                has_eyes = float(np.mean(white_eyes)) > 0.035

                if has_pink and (has_star or has_eyes):
                    return True
                if has_star and has_pink:
                    return True
    except Exception:
        pass

    return False


def _has_player_nametag_above(frame, bbox):
    """
    Detecta se há um NameTag de jogador do Roblox flutuando acima da caixa.
    Jogadores têm texto nítido (@Nome e nível/patinha) com cores características:
    - Verde pastel/neon (@Nome do jogador)
    - Rosa/magenta (ícone de patinha e pontuação)
    - Branco de alto contraste com borda preta
    Espíritos/ursos no chão NÃO têm nametag flutuando em cima!
    """
    try:
        import cv2
        import numpy as np

        h, w = frame.shape[:2]
        x1, y1, x2, y2 = [int(v) for v in bbox]
        bw = max(1, x2 - x1)
        bh = max(1, y2 - y1)

        # NameTags de jogadores do Roblox só aparecem acima de corpos de jogadores (bh >= 45 e bw >= 25)
        # Espíritos e gatinhos compactos (bh < 45) nunca têm nametag de jogador
        if bh < 45 or bw < 25:
            return False

        # Região imediatamente acima da cabeça (onde fica o NameTag do Roblox)
        tag_h = int(min(90, max(16, bh * 0.55)))
        tag_y1 = max(0, y1 - tag_h)
        tag_y2 = min(h - 1, y1 + int(bh * 0.06))
        tag_x1 = max(0, x1 - int(bw * 0.25))
        tag_x2 = min(w - 1, x2 + int(bw * 0.25))

        if tag_y2 <= tag_y1 or tag_x2 <= tag_x1:
            return False

        tag_crop = frame[tag_y1:tag_y2, tag_x1:tag_x2]
        if tag_crop.size == 0:
            return False

        # 1. Checar variações de borda horizontais (linhas de texto / letras @NOME)
        gray = cv2.cvtColor(tag_crop, cv2.COLOR_RGB2GRAY)
        sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        edge_density = float(np.mean(np.abs(sobel_x)))

        # 2. Checar cores típicas de NameTag no Roblox
        hsv = cv2.cvtColor(tag_crop, cv2.COLOR_RGB2HSV)

        # Verde pastel/neon do Roblox (@Nome em verde)
        green_mask = (hsv[:, :, 0] >= 25) & (hsv[:, :, 0] <= 90) & (hsv[:, :, 1] >= 20) & (hsv[:, :, 2] >= 120)
        green_ratio = float(np.mean(green_mask))

        # Rosa / Magenta da patinha e pontuação do Roblox Hanami
        pink_mask = ((hsv[:, :, 0] >= 135) | (hsv[:, :, 0] <= 15)) & (hsv[:, :, 1] >= 25) & (hsv[:, :, 2] >= 120)
        pink_ratio = float(np.mean(pink_mask))

        # Branco de texto nítido com contorno escuro
        white_text = (hsv[:, :, 1] <= 45) & (hsv[:, :, 2] >= 190)
        white_ratio = float(np.mean(white_text))

        # Se tiver densidade de caracteres/letras e qualquer uma das cores características de NameTag
        if edge_density > 14.0:
            if green_ratio > 0.015 or pink_ratio > 0.015 or white_ratio > 0.04:
                return True
    except Exception:
        pass

    return False


def _is_chase_worthy(det, conf_chase_white=0.25, conf_chase_black=0.22):
    """Permite perseguição de gatinhos visíveis sem confundir com o avatar central."""
    kind = det.get("kind", "white")
    conf = float(det.get("confidence", 0))
    need = conf_chase_white if kind == "white" else conf_chase_black
    if conf < need:
        return False
    cx, cy = det.get("rel_center", [0.5, 0.5])
    # Zona estreita do personagem no centro inferior
    if 0.38 < cx < 0.62 and cy > 0.55:
        return False
    # Aceita gatinhos no horizonte e rua à frente
    if cy < 0.10:
        return False
    return True


def detect_hanami_spirits(frame, yolo_obj=None, mode="all_spirits", conf_thres=0.25):
    """Detecta gatinhos com mapeamento inteligente de classes por nome e filtro rigoroso de jogadores."""
    dets = []
    conf_base = max(0.18, min(0.85, float(conf_thres or 0.25)))
    conf_infer = min(conf_base, 0.25)
    conf_white_keep = max(0.20, conf_base)
    conf_black_keep = max(0.20, min(conf_base, 0.32))

    if yolo_obj:
        try:
            h, w = frame.shape[:2]
            yolo_dets = run_inference(
                yolo_obj,
                yolo_obj.get("device", "cuda:0"),
                frame,
                conf_thres=conf_infer,
                iou_thres=0.45,
            )

            # Obter mapa de nomes das classes do modelo carregado
            model_names = {}
            if hasattr(yolo_obj.get("model"), "names"):
                model_names = yolo_obj["model"].names
            elif "class_names" in yolo_obj:
                model_names = {i: n for i, n in enumerate(yolo_obj["class_names"])}

            for d in yolo_dets:
                cid = int(d["class_id"])
                cname = ""
                if isinstance(model_names, dict):
                    cname = str(model_names.get(cid, "")).lower()
                elif isinstance(model_names, (list, tuple)) and cid < len(model_names):
                    cname = str(model_names[cid]).lower()

                # Se a classe for explicitamente um jogador / person / avatar, DESCARTA!
                if "player" in cname or "person" in cname or "jogador" in cname or "avatar" in cname:
                    continue

                # Mapeamento inteligente de classe
                kind = None
                if "branco" in cname or "white" in cname or "sakura" in cname:
                    kind = "white"
                elif "preto" in cname or "black" in cname or "kuro" in cname:
                    kind = "black"
                elif cid == 0 and len(model_names) <= 2:
                    kind = "white"
                elif cid == 1 and len(model_names) <= 2:
                    kind = "black"
                elif cid == 2 and ("urso" in cname or "spirit" in cname or "gato" in cname):
                    kind = "white"
                elif cid == 3 and ("urso" in cname or "spirit" in cname or "gato" in cname):
                    kind = "black"
                else:
                    # Modelo genérico
                    if cid == 0:
                        kind = "white"
                    elif cid == 1:
                        kind = "black"
                    else:
                        continue

                conf = float(d["confidence"])
                if kind == "white" and conf < conf_white_keep:
                    continue
                if kind == "black" and conf < conf_black_keep:
                    continue

                cx, cy = d["rel_center"]
                x1, y1, x2, y2 = d["bbox"]
                bw = max(1.0, abs(x2 - x1))
                bh = max(1.0, abs(y2 - y1))
                rel_w = bw / float(max(1, w))
                rel_h = bh / float(max(1, h))

                # FILTRO 1: Descartar zona do próprio avatar em 3ª pessoa
                if _is_player_avatar_zone(cx, cy, rel_w, rel_h, bbox=d["bbox"], frame_shape=frame.shape):
                    continue

                # FILTRO 2: Proporção de humanoide alto em pé (bh >= 1.95 * bw = corpo alto de player com pernas)
                # Gatinhos flutuando com orelhas em pé têm bh entre 0.6 * bw e 1.85 * bw
                if bh > 1.95 * bw:
                    continue

                # FILTRO 3: NameTag flutuante (@Nome e patinha) acima da cabeça
                if _has_player_nametag_above(frame, d["bbox"]):
                    continue

                # FILTRO 4: Cursor de mouse customizado do jogo (gatinho preto pixel-art)
                if _is_game_mouse_cursor(frame, d["bbox"]):
                    continue

                if not _spirit_geometry_ok(d["bbox"], frame.shape, kind=kind):
                    continue
                if kind == "white" and not _white_spirit_ok(frame, d["bbox"]):
                    continue
                if kind == "black" and not _black_spirit_ok(frame, d["bbox"]):
                    continue
                if _looks_like_player_avatar(frame, d["bbox"], kind):
                    continue

                label = "Gatinho Branco (Sakura)" if kind == "white" else "Gatinho Preto (Kuro)"
                if mode == "white_only" and kind != "white":
                    continue
                if mode == "black_only" and kind != "black":
                    continue
                dets.append({
                    "class_id": cid,
                    "label": label,
                    "confidence": conf,
                    "bbox": d["bbox"],
                    "rel_center": [cx, cy],
                    "kind": kind,
                })
            # No máximo 4 por frame
            dets.sort(key=lambda x: x["confidence"], reverse=True)
            return dets[:4]
        except Exception:
            pass

    # Fallback morfológico com filtro de nametag e proporção
    import cv2
    import numpy as np

    if mode in ["all_spirits", "black_only"]:
        h, w = frame.shape[:2]
        gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        _, mask_black = cv2.threshold(blurred, 75, 255, cv2.THRESH_BINARY_INV)
        mask_black[:int(h * 0.10), :] = 0
        mask_black[int(h * 0.90):, :] = 0
        contours_b, _ = cv2.findContours(mask_black, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours_b:
            area = cv2.contourArea(cnt)
            if 25 < area < 30000:
                x, y, cw, ch = cv2.boundingRect(cnt)
                aspect = float(cw) / max(1, ch)
                cx = (x + cw / 2.0) / float(w)
                cy = (y + ch / 2.0) / float(h)
                bbox = [x, y, x + cw, y + ch]
                # Ignora HUD e menus do canto superior esquerdo
                if cx < 0.10 and cy < 0.30:
                    continue
                if _is_player_avatar_zone(cx, cy, cw / float(w), ch / float(h), bbox=bbox, frame_shape=frame.shape):
                    continue
                if ch > 1.95 * cw:
                    continue
                if _has_player_nametag_above(frame, bbox):
                    continue
                if _looks_like_player_avatar(frame, bbox, "black"):
                    continue
                if _is_game_mouse_cursor(frame, bbox):
                    continue
                if 0.35 < aspect < 2.8 and _spirit_geometry_ok(bbox, frame.shape, "black") and _black_spirit_ok(frame, bbox):
                    dets.append({
                        "class_id": 1,
                        "label": "Gatinho Preto (Kuro)",
                        "confidence": 0.52,
                        "bbox": bbox,
                        "rel_center": [cx, cy],
                        "kind": "black",
                    })

    if mode in ["all_spirits", "white_only"] and len(dets) < 3:
        h, w = frame.shape[:2]
        gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        _, mask_white = cv2.threshold(blurred, 205, 255, cv2.THRESH_BINARY)
        mask_white[:int(h * 0.12), :] = 0
        mask_white[int(h * 0.90):, :] = 0
        contours_w, _ = cv2.findContours(mask_white, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours_w:
            area = cv2.contourArea(cnt)
            if 30 < area < 25000:
                x, y, cw, ch = cv2.boundingRect(cnt)
                aspect = float(cw) / max(1, ch)
                cx = (x + cw / 2.0) / float(w)
                cy = (y + ch / 2.0) / float(h)
                bbox = [x, y, x + cw, y + ch]
                if cx < 0.10 and cy < 0.30:
                    continue
                if _is_player_avatar_zone(cx, cy, cw / float(w), ch / float(h), bbox=bbox, frame_shape=frame.shape):
                    continue
                if ch > 1.95 * cw:
                    continue
                if _has_player_nametag_above(frame, bbox):
                    continue
                if _looks_like_player_avatar(frame, bbox, "white"):
                    continue
                if _is_game_mouse_cursor(frame, bbox):
                    continue
                if 0.35 < aspect < 2.8 and _spirit_geometry_ok(bbox, frame.shape, "white") and _white_spirit_ok(frame, bbox):
                    dets.append({
                        "class_id": 0,
                        "label": "Gatinho Branco (Sakura)",
                        "confidence": 0.50,
                        "bbox": bbox,
                        "rel_center": [cx, cy],
                        "kind": "white",
                    })
    dets.sort(key=lambda x: x["confidence"], reverse=True)
    return dets[:4]


def _run_hanami_patrol_step(waypoints, current_wp_idx, wp_started_at, now, sim_mode, jump_prob=0.05, refresh_keys=False):
    """Anda um passo do circuito de waypoints. Sempre usado quando não há urso chase-worthy."""
    wp = waypoints[current_wp_idx % len(waypoints)]
    dur_s = wp.get("duration_ms", 2500) / 1000.0
    advanced = False

    if (now - wp_started_at) >= dur_s:
        current_wp_idx = (current_wp_idx + 1) % len(waypoints)
        wp = waypoints[current_wp_idx]
        wp_started_at = now
        advanced = True
        log("movement", f"🗺️ Waypoint: {wp['name']} — {wp['description']}")

        # Rotação ativa da câmera ao mudar de waypoint para seguir a rua
        dir_str = wp.get("direction", "w").lower()
        if "a" in dir_str and "d" not in dir_str:
            input_controller.rotate_camera(-140, simulation=sim_mode)
        elif "d" in dir_str and "a" not in dir_str:
            input_controller.rotate_camera(140, simulation=sim_mode)
        elif wp.get("scan_camera", False):
            input_controller.rotate_camera(70, simulation=sim_mode)
            time.sleep(0.04)
            input_controller.rotate_camera(-70, simulation=sim_mode)

    dir_keys = [k for k in wp.get("direction", "w").split("+") if k]
    if not dir_keys:
        dir_keys = ["w"]

    if not sim_mode:
        input_controller.focus_game_window(config.get("window_title", "Roblox"))
    input_controller.hold_keys(dir_keys, simulation=sim_mode, refresh=refresh_keys)

    if jump_prob > 0 and random.random() < jump_prob:
        input_controller.press_key("space", simulation=sim_mode, refresh=True)
        time.sleep(0.05)
        input_controller.release_key("space", simulation=sim_mode)

    emit(
        "action",
        action="patrol",
        keys=dir_keys,
        message=f"Patrulhando mapa: {wp['name']} | teclas={'+'.join(dir_keys).upper()}{' (SIMULAÇÃO)' if sim_mode else ''}",
        simulation=sim_mode,
    )
    return current_wp_idx, wp_started_at, advanced, wp

def _async_key_down(vk):
    if sys.platform != "win32":
        return False
    try:
        import ctypes
        return bool(ctypes.windll.user32.GetAsyncKeyState(vk) & 0x8000)
    except Exception:
        return False


def _read_wasd_combo():
    """Lê teclas WASD físicas que o usuário está segurando no teclado."""
    vk = {"w": 0x57, "a": 0x41, "s": 0x53, "d": 0x44}
    held = [k for k, code in vk.items() if _async_key_down(code)]
    # Ordem estável W/A/S/D
    order = ["w", "a", "s", "d"]
    return [k for k in order if k in held]


def _save_hanami_waypoints(waypoints, map_name="Distrito de Hanami (Gravado)"):
    wp_file = BASE_DIR.parent.parent / "bots" / "roblox" / "hanami_district_collector" / "waypoints.json"
    wp_file.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "map_name": map_name,
        "version": "recorded-" + time.strftime("%Y%m%d-%H%M%S"),
        "description": "Rota gravada manualmente pelo modo Mapear Ruas (WASD + atalhos).",
        "default_loop": True,
        "recorded_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "waypoints": waypoints,
    }
    with open(wp_file, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    return str(wp_file.resolve())


def street_mapping_worker():
    """Modo Mapear Ruas: você anda com WASD; o bot grava a rota.
    Atalhos:
      F4  = marcar checkpoint da rua
      F3  = desfazer último ponto
      END = terminar mapeamento e salvar waypoints.json
    """
    global running, paused, config

    log("info", "🗺️ MODO MAPEAR RUAS ativo — ande com WASD no Roblox")
    log("info", "⌨️ Atalhos: F4=marcar ponto | F3=desfazer | END=terminar e salvar")
    emit("status", state="running", device="MAP", bot_id="roblox-hanami-spirit-collector", model="Gravador de Ruas")
    emit(
        "action",
        action="mapping",
        message="Mapear Ruas: ande com WASD. F4=ponto | F3=desfazer | END=salvar",
        simulation=True,
    )

    input_controller.release_all()
    recorded = []
    current_keys = []
    segment_started = time.time()
    last_preview = 0.0
    preview_interval = 1.0 / max(1, config.get("preview_fps", 6))
    # edge detect para atalhos
    prev_f4 = prev_f3 = prev_end = False
    last_status_log = 0.0

    VK_F3, VK_F4, VK_END = 0x72, 0x73, 0x23

    while running:
        if paused:
            time.sleep(0.1)
            continue

        now = time.time()
        held = _read_wasd_combo()

        # Novo segmento quando as teclas mudam
        if held != current_keys:
            if current_keys:
                dur_ms = int(max(100, (now - segment_started) * 1000))
                recorded.append({
                    "id": f"seg_{len(recorded)+1:03d}",
                    "name": f"Trecho {len(recorded)+1} ({'+'.join(current_keys).upper()})",
                    "direction": "+".join(current_keys),
                    "duration_ms": dur_ms,
                    "scan_camera": True,
                    "description": f"Gravado: {'+'.join(current_keys).upper()} por {dur_ms}ms",
                })
                log("movement", f"📍 Segmento salvo: {'+'.join(current_keys).upper()} ({dur_ms}ms) — total {len(recorded)}")
            current_keys = list(held)
            segment_started = now

        # Atalhos
        f4 = _async_key_down(VK_F4)
        f3 = _async_key_down(VK_F3)
        end = _async_key_down(VK_END)

        if f4 and not prev_f4:
            # Força fechar segmento atual mesmo sem mudar teclas
            if current_keys:
                dur_ms = int(max(100, (now - segment_started) * 1000))
                recorded.append({
                    "id": f"cp_{len(recorded)+1:03d}",
                    "name": f"Checkpoint {len(recorded)+1}",
                    "direction": "+".join(current_keys),
                    "duration_ms": dur_ms,
                    "scan_camera": True,
                    "description": f"Checkpoint manual F4 — {'+'.join(current_keys).upper()}",
                })
                segment_started = now
                log("info", f"📌 Checkpoint F4 — {len(recorded)} pontos na rota")
                emit("action", action="mapping_checkpoint", message=f"Checkpoint #{len(recorded)} marcado", simulation=True)
            else:
                log("warning", "F4: segure WASD enquanto marca o ponto")

        if f3 and not prev_f3:
            if recorded:
                removed = recorded.pop()
                log("info", f"↩️ Desfeito: {removed.get('name')} — restam {len(recorded)}")
                emit("action", action="mapping_undo", message=f"Desfeito. Pontos: {len(recorded)}", simulation=True)
            else:
                log("warning", "Nada para desfazer")

        if end and not prev_end:
            # Fecha segmento aberto
            if current_keys:
                dur_ms = int(max(100, (now - segment_started) * 1000))
                recorded.append({
                    "id": f"seg_{len(recorded)+1:03d}",
                    "name": f"Trecho final ({'+'.join(current_keys).upper()})",
                    "direction": "+".join(current_keys),
                    "duration_ms": dur_ms,
                    "scan_camera": True,
                    "description": "Último trecho antes de salvar (END)",
                })
            if len(recorded) < 1:
                log("warning", "END: nenhum trecho gravado ainda — continue andando")
            else:
                path = _save_hanami_waypoints(recorded)
                log("info", f"✅ Mapa salvo com {len(recorded)} waypoints → {path}")
                emit("action", action="mapping_saved", message=f"Rota salva ({len(recorded)} pontos)! Pode voltar ao modo Coleta.", simulation=False)
                emit("status", state="stopped", message=f"Mapeamento concluído: {len(recorded)} waypoints")
                running = False
                break

        prev_f4, prev_f3, prev_end = f4, f3, end

        if (now - last_status_log) >= 3.0:
            last_status_log = now
            keys_txt = "+".join(held).upper() if held else "parado"
            emit(
                "action",
                action="mapping",
                message=f"🗺️ Mapeando… teclas={keys_txt} | pontos={len(recorded)} | F4=ponto F3=desfazer END=salvar",
                simulation=True,
            )

        # Preview com HUD de mapeamento
        if config.get("send_preview", True) and (now - last_preview) >= preview_interval:
            last_preview = now
            try:
                import cv2
                frame = capture_frame(config)
                if frame is not None:
                    h, w = frame.shape[:2]
                    scale = 480 / max(h, w)
                    pv = cv2.resize(frame, (int(w * scale), int(h * scale)))
                    keys_txt = "+".join(held).upper() if held else "-"
                    lines = [
                        "MODO MAPEAR RUAS",
                        f"WASD: {keys_txt}  |  pontos: {len(recorded)}",
                        "F4=ponto  F3=desfazer  END=salvar",
                    ]
                    y = 22
                    for line in lines:
                        cv2.putText(pv, line, (10, y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 200), 1, cv2.LINE_AA)
                        y += 20
                    bgr = cv2.cvtColor(pv, cv2.COLOR_RGB2BGR)
                    _, buffer = cv2.imencode(".jpg", bgr, [cv2.IMWRITE_JPEG_QUALITY, 55])
                    b64 = base64.b64encode(buffer).decode("utf-8")
                    emit("preview_frame", data=f"data:image/jpeg;base64,{b64}")
            except Exception:
                pass

        time.sleep(0.03)

    input_controller.release_all()
    log("info", "🗺️ Gravador de ruas encerrado")


def hanami_worker():
    global running, paused, config

    mode = config.get("mode", "all_spirits")
    if mode == "street_mapping":
        street_mapping_worker()
        return

    log("info", "🌸 Hanami Spirit Collector acordou — Patrulha de mapa + coleta de ursos pronta!")
    emit("status", state="initializing", message="Carregando YOLO11 dos ursos (hanami_spirits)...")

    # Suporta o modelo especializado yolo11_hanami_spirits.pt ou o modelo universal yolo11_roblox_official.pt
    raw_w = config.get("weights", "")
    if not raw_w or "yolo11n_official" in str(raw_w).lower() or "yolo_hanami_spirits_v1" in str(raw_w).lower():
        raw_w = "yolo11_hanami_spirits.pt"
        config["weights"] = raw_w
        log("info", "🌸 Modelo selecionado: yolo11_hanami_spirits.pt (Especializado nos ursos de Hanami)")
    elif "roblox_official" in str(raw_w).lower():
        log("info", "🎮 Modelo selecionado: yolo11_roblox_official.pt (Multi-jogos Roblox com filtro de players)")
    hanami_weights = resolve_weights_file(raw_w)

    yolo_obj = None
    try:
        emit("status", state="initializing", message=f"Carregando {Path(hanami_weights).name} na GPU/CPU...")
        yolo_obj, dev_used, _ = load_yolo_model(hanami_weights, config.get("device", "auto"))
        log("info", f"🌸 Motor Neural YOLO11 Oficial de Ursos ativo: {Path(hanami_weights).name} em {dev_used.upper()}")
        emit("status", state="running", device=str(dev_used).upper(), bot_id="roblox-hanami-spirit-collector", model=Path(hanami_weights).name)
    except Exception as e:
        log("warning", f"YOLO11 em fallback morfológico: {e}")
        emit("status", state="running", device="CPU-FALLBACK", bot_id="roblox-hanami-spirit-collector", model="Rastreador Nativo de Espíritos de Hanami")
        emit("log", level="warning", message=f"Modelo YOLO falhou ao carregar ({e}). Patrulha continua com fallback.")

    navmesh = load_hanami_navmesh()
    if navmesh:
        n_streets = len(navmesh.get("walkable_streets", []))
        n_obs = len(navmesh.get("obstacles_and_walls", []))
        log("info", f"🗺️ NavMesh Persistente Ativo: {n_streets} ruas andáveis e {n_obs} paredes/construções salvas em hanami_navmesh.json!")
        emit("navmesh_loaded", map_name=navmesh.get("map_name"), streets=n_streets, obstacles=n_obs)

    waypoints = load_hanami_waypoints()
    # Hanami PRECISA andar de verdade — simulação só se o usuário forçar allow_simulation
    if config.get("simulation_mode") and not config.get("allow_simulation"):
        config["simulation_mode"] = False
        log("warning", "⚠️ Simulação desligada automaticamente no Hanami (senão o personagem não anda).")
    sim_mode = bool(config.get("simulation_mode", False))
    mode = config.get("mode", "all_spirits")
    dwell_time = float(config.get("collection_dwell_time", 3.0))
    if sim_mode:
        log("warning", "⚠️ Modo Simulação ligado — o personagem NÃO anda de verdade. Desligue em Configurações.")
        emit("log", level="warning", message="Simulação ligada: sem teclas reais. Desligue para patrulhar o mapa.")
    else:
        log("info", "⌨️ Teclas reais ATIVAS — focando janela do Roblox e segurando W/A/D na patrulha")
        input_controller.focus_game_window(config.get("window_title", "Roblox"), force=True)

    # Ciclo de Descanso AFK (Prevenção de Kick de 20 min do Roblox)
    rest_enabled = config.get("rest_enabled", True)
    work_duration_secs = max(60, int(config.get("work_duration_mins", 10)) * 60)
    # Metade do tempo permitido pelo Roblox (10 minutos padrão)
    rest_duration_secs = max(60, int(config.get("rest_duration_mins", 10)) * 60)

    bot_state = "WORKING"  # "WORKING", "COLLECTING", "RESTING"
    work_started_at = time.time()
    rest_started_at = 0.0
    dwell_started_at = 0.0
    current_wp_idx = 0
    wp_started_at = time.time()
    last_anti_kick = 0.0
    last_rest_log = 0.0
    spirits_collected = 0
    last_preview_time = 0.0
    preview_interval = 1.0 / max(1, config.get("preview_fps", 6))
    current_target_name = ""
    recently_collected = []
    approach_started_at = 0.0
    approach_timeout_s = float(config.get("approach_timeout_s", 3.5))
    last_key_refresh = 0.0
    # Motor Anti-Enrosco (Detecção física de estagnação de tela + Spatial Vision Gemini)
    last_motion_check = time.time()
    last_frame_gray = None
    stuck_counter = 0
    last_unstuck_time = 0.0

    # Patrulha contínua SEMPRE: gatinhos longe na rua — patrulhar o mapa inteiro
    patrol_when_empty = True
    config["patrol_when_empty"] = True
    conf_detect = float(config.get("conf_thres", 0.25))
    if conf_detect > 0.45:
        # Slider alto demais some com gatinhos; mantém detecção sensível
        log("info", f"🌸 conf_thres={conf_detect:.2f} alto — detecção usará 0.25; perseguição ativa com conf≥0.22")
    conf_detect = min(conf_detect, 0.35)
    conf_detect = max(0.18, conf_detect)
    conf_chase = float(config.get("conf_chase", 0.28))

    log(
        "info",
        f"🌸 Config: modo='{mode}', detect≥{conf_detect:.2f}, chase≥{conf_chase:.2f}, "
        f"dwell={dwell_time}s, PATRULHA SEMPRE ligada, AFK={int(rest_duration_secs/60)}min"
    )
    setup_active_learning(config)

    while running:
        if paused:
            input_controller.release_all()
            time.sleep(0.1)
            continue

        now = time.time()
        loop_t0 = now
        refresh_keys = (now - last_key_refresh) >= 0.35
        if refresh_keys:
            last_key_refresh = now

        # Re-lê simulação ao vivo (CONFIG_UPDATE) e bloqueia no Hanami
        if config.get("simulation_mode") and not config.get("allow_simulation"):
            config["simulation_mode"] = False
        sim_mode = bool(config.get("simulation_mode", False))

        # ==========================================
        # 1. GERENCIAMENTO DO CICLO DE DESCANSO AFK
        # ==========================================
        if rest_enabled and bot_state == "WORKING":
            if (now - work_started_at) >= work_duration_secs:
                bot_state = "RESTING"
                rest_started_at = now
                last_rest_log = now
                last_anti_kick = now
                input_controller.release_all()
                log("info", f"☕ Iniciando descanso seguro AFK ({int(rest_duration_secs/60)} min - metade do tempo de AFK do Roblox)...")
                emit("action", action="resting", message="Descanso AFK Seguro em andamento", simulation=sim_mode)

        if bot_state == "RESTING":
            input_controller.release_all()
            elapsed_rest = now - rest_started_at

            if elapsed_rest >= rest_duration_secs:
                bot_state = "WORKING"
                work_started_at = now
                wp_started_at = now
                log("info", "🌸 Fim do descanso AFK! Acordando e reiniciando patrulha e coleta de ursos!")
                emit("action", action="resuming", message="Retomando patrulha de Hanami", simulation=sim_mode)
            else:
                if (now - last_anti_kick) >= 180.0:
                    last_anti_kick = now
                    if not sim_mode:
                        try:
                            input_controller.focus_game_window(config.get("window_title", "Roblox"), force=True)
                            input_controller.press_key('a', simulation=False, refresh=True)
                            time.sleep(0.04)
                            input_controller.release_key('a', simulation=False)
                        except Exception:
                            pass
                    log("info", "🛡️ Anti-Kick Roblox: Micro-ação de segurança executada (anti-inatividade 20m)")

                if (now - last_rest_log) >= 60.0:
                    last_rest_log = now
                    rem_min = max(1, int(math.ceil((rest_duration_secs - elapsed_rest) / 60)))
                    log("info", f"💤 Descanso AFK Seguro: restam {rem_min} min para voltar à ativa... ☕")

                time.sleep(0.15)
                continue

        # ==========================================
        # 2. CAPTURA E PROCESSAMENTO VISUAL
        # ==========================================
        frame = capture_frame(config)
        t_cap = time.time()
        detections = []

        if frame is None:
            # Sem tela ainda: MESMO ASSIM anda o circuito (não fica parado)
            if bot_state == "WORKING":
                current_wp_idx, wp_started_at, _, wp = _run_hanami_patrol_step(
                    waypoints, current_wp_idx, wp_started_at, now, sim_mode,
                    jump_prob=float(config.get("jump_prob", 0.05)),
                    refresh_keys=refresh_keys,
                )
                emit("action", action="patrol", message=f"Andando sem vision: {wp['name']}", simulation=sim_mode)
            time.sleep(0.12)
            continue

        detections = detect_hanami_spirits(
            frame,
            yolo_obj=yolo_obj,
            mode=mode,
            conf_thres=conf_detect,
        )

        # 2.5 Active Continuous Learning com Google Gemini 2.0 Flash
        if active_learner:
            if active_learner.should_sample(detections):
                active_learner.submit_frame_for_learning(frame, reason="hanami_runtime")

            if not detections:
                oracle_dets = active_learner.get_latest_oracle_detections()
                if oracle_dets:
                    for od in oracle_dets:
                        kind_val = od.get("kind", "white")
                        label_val = od.get("label", "Gatinho Branco (Sakura)" if kind_val == "white" else "Gatinho Preto (Kuro)")
                        detections.append({
                            "class_id": od.get("class_id", 0),
                            "label": label_val,
                            "confidence": od.get("confidence", 0.90),
                            "bbox": od["bbox"],
                            "rel_center": od["rel_center"],
                            "kind": kind_val,
                        })
                    log("vision", f"🔮 Oráculo Gemini identificou {len(oracle_dets)} gatinho(s) em tempo real!")
        # Re-lê conf ao vivo (slider) sem matar a sensibilidade
        live_conf = float(config.get("conf_thres", conf_detect))
        conf_detect = max(0.18, min(0.35, live_conf if live_conf <= 0.45 else 0.25))
        conf_chase = max(conf_detect, float(config.get("conf_chase", 0.28)))
        t_inf = time.time()

        fps_capture = round(1.0 / max(0.001, t_cap - loop_t0), 1)
        fps_inference = round(1.0 / max(0.001, t_inf - t_cap), 1)

        # ==========================================
        # 3. ESTADO DE ABSORÇÃO (DELAY DE 3 SEGUNDOS)
        # ==========================================
        if bot_state == "COLLECTING":
            input_controller.release_all()
            elapsed_dwell = now - dwell_started_at

            if elapsed_dwell >= dwell_time:
                spirits_collected += 1
                bot_state = "WORKING"
                wp_started_at = now
                approach_started_at = 0.0
                log("info", f"✨ Gatinho {current_target_name} absorvido com sucesso! Total na sessão: {spirits_collected} 🌸")
                emit("action", action="collected", message=f"Gatinho absorvido (+1)! Total: {spirits_collected}", simulation=sim_mode)
            else:
                rem_s = round(max(0.0, dwell_time - elapsed_dwell), 1)
                emit("action", action="absorbing", message=f"🌸 Absorvendo {current_target_name}... restam {rem_s}s", simulation=sim_mode)
                time.sleep(0.08)

        # ==========================================
        # 4. PATRULHA PRIMÁRIA + APROXIMAÇÃO + ANTI-ENROSCO
        # ==========================================
        elif bot_state == "WORKING":
            # 3.5 DETECTOR ANTI-ENROSCO EM TEMPO REAL (Físico + Gemini Spatial Vision)
            gemini_nav = active_learner.get_latest_spatial_guidance() if active_learner else {}
            gemini_says_stuck = bool(gemini_nav.get("is_stuck", False) or gemini_nav.get("path_blocked", False))

            # Checagem de fluxo de movimento na metade inferior da tela a cada 1.1s
            if (now - last_motion_check) >= 1.1:
                try:
                    import cv2
                    import numpy as np
                    h_f, w_f = frame.shape[:2]
                    lower_zone = frame[int(h_f * 0.40):, :]
                    gray_thumb = cv2.resize(cv2.cvtColor(lower_zone, cv2.COLOR_RGB2GRAY), (120, 60))
                    if last_frame_gray is not None:
                        diff_val = float(np.mean(cv2.absdiff(gray_thumb, last_frame_gray)))
                        # Se segurou teclas para andar e a tela praticamente estagnou (colisão frontal com parede/bambu):
                        if diff_val < 2.0:
                            stuck_counter += 1
                        else:
                            stuck_counter = max(0, stuck_counter - 1)
                    last_frame_gray = gray_thumb
                    last_motion_check = now
                except Exception:
                    pass

            is_stuck_now = (stuck_counter >= 2 or (gemini_says_stuck and (now - last_unstuck_time) >= 3.5))
            if is_stuck_now and (now - last_unstuck_time) >= 3.5:
                stuck_counter = 0
                last_unstuck_time = now
                reason_desc = gemini_nav.get("reason", "Estagnação física contra parede/obstáculo") if gemini_says_stuck else "Colisão contra parede/obstáculo (estagnação física)"
                suggested = gemini_nav.get("suggested_turn", "clear")

                log("warning", f"🚧 Anti-Enrosco Acionado: {reason_desc}! Executando manobra de desvencilhar...")
                emit("action", action="unstuck", message=f"Desvencilhando de obstáculo: {reason_desc}", simulation=sim_mode)
                input_controller.release_all()
                if not sim_mode:
                    input_controller.focus_game_window(config.get("window_title", "Roblox"), force=True)

                # Passo 1: Ré firme por 0.65s
                input_controller.press_key('s', simulation=sim_mode, refresh=True)
                time.sleep(0.65)
                # Passo 2: Pulo para desengatar de quinas e pilares
                input_controller.press_key(' ', simulation=sim_mode, refresh=True)
                time.sleep(0.30)
                input_controller.release_key(' ', simulation=sim_mode)
                time.sleep(0.15)
                input_controller.release_key('s', simulation=sim_mode)

                # Passo 3: Giro de câmera em direção à rua aberta
                if suggested == "turn_left":
                    turn_dx = -260
                elif suggested == "turn_right":
                    turn_dx = 260
                elif suggested == "turn_around":
                    turn_dx = 380
                else:
                    turn_dx = random.choice([-280, 280])
                input_controller.rotate_camera(turn_dx, simulation=sim_mode)
                time.sleep(0.15)

                # Passo 4: Avanço lateral para desviar
                esc_key = 'a' if turn_dx < 0 else 'd'
                input_controller.hold_keys(['w', esc_key], simulation=sim_mode, refresh=True)
                time.sleep(0.45)
                input_controller.release_all()
                wp_started_at = now
                continue

            now_ts = now
            candidates = [
                d for d in detections
                if not any(
                    math.sqrt((d["rel_center"][0] - rc[0]) ** 2 + (d["rel_center"][1] - rc[1]) ** 2) < 0.12
                    and (now_ts - rc[2]) < 4.0
                    for rc in recently_collected
                )
            ]
            chase_targets = [
                d for d in candidates
                if _is_chase_worthy(d, conf_chase_white=max(0.24, conf_chase * 0.75), conf_chase_black=max(0.20, conf_chase * 0.70))
            ]

            if approach_started_at > 0 and (now - approach_started_at) >= approach_timeout_s:
                if chase_targets:
                    phantom = chase_targets[0]
                    recently_collected.append((phantom["rel_center"][0], phantom["rel_center"][1], now))
                    if len(recently_collected) > 20:
                        recently_collected.pop(0)
                chase_targets = []
                approach_started_at = 0.0
                log("movement", "🗺️ Aproximação expirou — continuando patrulha do mapa")

            use_target = bool(chase_targets) and mode != "patrol_only"

            if use_target:
                target = min(
                    chase_targets,
                    key=lambda d: (d["rel_center"][0] - 0.5) ** 2 + (d["rel_center"][1] - 0.40) ** 2,
                )
                cx, cy = target["rel_center"]
                if approach_started_at <= 0:
                    approach_started_at = now

                if cy >= 0.34 and 0.32 <= cx <= 0.68:
                    bot_state = "COLLECTING"
                    dwell_started_at = now
                    current_target_name = target["label"]
                    approach_started_at = 0.0
                    recently_collected.append((cx, cy, now))
                    if len(recently_collected) > 20:
                        recently_collected.pop(0)
                    input_controller.release_all()
                    log("movement", f"🐾 Em alcance de coleta com {current_target_name}! Iniciando absorção ({dwell_time}s)...")
                else:
                    # Rotação ativa de câmera em direção ao urso
                    error_x = cx - 0.50
                    if abs(error_x) > 0.035:
                        turn_dx = int(error_x * 400)
                        turn_dx = max(-180, min(180, turn_dx))
                        input_controller.rotate_camera(turn_dx, simulation=sim_mode)

                    keys_to_press = ["w"]
                    if error_x < -0.15:
                        keys_to_press.append("a")
                    elif error_x > 0.15:
                        keys_to_press.append("d")

                    if not sim_mode:
                        input_controller.focus_game_window(config.get("window_title", "Roblox"))
                    input_controller.hold_keys(keys_to_press, simulation=sim_mode, refresh=refresh_keys)

                    emit(
                        "action",
                        action="approaching",
                        keys=keys_to_press,
                        message=f"Aproximando de {target['label']} ({int(target['confidence']*100)}%) | teclas={'+'.join(keys_to_press).upper()}",
                        simulation=sim_mode,
                    )
            else:
                # Comportamento principal: andar o mapa inteiro até achar ursos de perto
                approach_started_at = 0.0
                current_wp_idx, wp_started_at, _, wp = _run_hanami_patrol_step(
                    waypoints,
                    current_wp_idx,
                    wp_started_at,
                    now,
                    sim_mode,
                    jump_prob=float(config.get("jump_prob", 0.05)),
                    refresh_keys=refresh_keys,
                )
                n_far = len(candidates)
                extra = f" | {n_far} urso(s) longe/fraco(s) — seguindo circuito" if n_far else ""
                emit(
                    "action",
                    action="patrol",
                    message=f"Patrulhando mapa: {wp['name']}{extra}",
                    simulation=sim_mode,
                )

        # ==========================================
        # 5. EMISSÃO DE DETECÇÃO & PREVIEW
        # ==========================================
        emit("detection",
             objects=detections,
             fps_capture=fps_capture,
             fps_inference=fps_inference,
             detected_spirits=len(detections),
             detected_white=len([d for d in detections if d.get("kind") == "white"]),
             detected_black=len([d for d in detections if d.get("kind") == "black"]),
             detected_coins=len([d for d in detections if d.get("kind") == "white"]),
             detected_players=len([d for d in detections if d.get("kind") == "black"]),
             timestamp=now
        )

        if config.get("send_preview", True) and (now - last_preview_time) >= preview_interval:
            last_preview_time = now
            try:
                import cv2
                h, w = frame.shape[:2]
                scale = 480 / max(h, w)
                pv_w, pv_h = int(w * scale), int(h * scale)
                pv_img = cv2.resize(frame, (pv_w, pv_h))

                for d in detections:
                    x1, y1, x2, y2 = [int(v * scale) for v in d["bbox"]]
                    color = (255, 180, 240) if d.get("kind") == "white" else (180, 100, 255)
                    cv2.rectangle(pv_img, (x1, y1), (x2, y2), color, 2)
                    conf_pct = int(float(d.get("confidence", 0)) * 100)
                    cv2.putText(
                        pv_img,
                        f"{d['label'].upper()} {conf_pct}%",
                        (x1, max(15, y1 - 4)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.4,
                        color,
                        1,
                        cv2.LINE_AA
                    )

                # Status overlay
                st_text = f"HANAMI: {bot_state} | URSOS: {spirits_collected} | FPS: {fps_capture}"
                cv2.putText(pv_img, st_text, (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 200), 1, cv2.LINE_AA)

                bgr = cv2.cvtColor(pv_img, cv2.COLOR_RGB2BGR)
                _, buffer = cv2.imencode(".jpg", bgr, [cv2.IMWRITE_JPEG_QUALITY, 55])
                b64 = base64.b64encode(buffer).decode("utf-8")
                emit("preview_frame", data=f"data:image/jpeg;base64,{b64}")
            except Exception:
                pass

        time.sleep(0.02)

    input_controller.release_all()
    stop_active_learning()
    log("info", "Bot Hanami foi descansar 💗")
    emit("status", state="stopped", message="Bot finalizado")

# Main worker loop
def bot_worker():
    global running, paused, config

    bot_id = config.get("bot_id", "")
    mode = config.get("mode", "")

    emit("status", state="initializing", message="Acordando o motor de visão...")
    log("info", f"Worker iniciado (bot_id={bot_id}, mode={mode})")

    # Se for Hanami Spirit Collector, executa motor autônomo com patrulha e descanso AFK
    if bot_id == "roblox-hanami-spirit-collector" or mode in ["all_spirits", "white_only", "black_only", "patrol_only", "street_mapping"] or "hanami" in str(config.get("weights", "")).lower():
        hanami_worker()
        return

    log("info", "Iniciando worker do RobloxBot...")
    emit("status", state="initializing", message="Inicializando modelo e captura...")

    raw_weights = config.get("weights", "")
    weights_path = resolve_weights_file(raw_weights)

    if not weights_path or not os.path.exists(weights_path):
        log("error", f"Arquivo de modelo não encontrado: {raw_weights}")
        emit("status", state="error", message=f"Modelo YOLO não encontrado: {raw_weights}")
        running = False
        return

    try:
        model, device, class_names = load_yolo_model(weights_path, config.get("device", "auto"))
    except Exception as e:
        log("error", f"Erro fatal ao carregar YOLO: {e}")
        emit("status", state="error", message=str(e))
        running = False
        return

    emit("status", state="running", device=str(device).upper(), model=Path(weights_path).name)
    log("info", f"Bot acordou 🧸 — Pronto para trabalhar em {str(device).upper()}!")
    setup_active_learning(config)

    last_preview_time = 0
    preview_interval = 1.0 / max(1, config.get("preview_fps", 6))
    last_capture_warn = 0

    fps_count = 0
    fps_start = time.time()
    cur_fps = 0.0

    while running:
        if paused:
            input_controller.release_all()
            time.sleep(0.1)
            continue

        loop_start = time.time()

        # 1. Capture screen
        frame = capture_frame(config)
        if frame is None:
            now = time.time()
            if now - last_capture_warn > 4.0:
                log("warning", "Aguardando janela do jogo ou tela visível para captura...")
                last_capture_warn = now
            time.sleep(0.2)
            continue

        t_cap = time.time()

        # 2. Run inference
        try:
            detections = run_inference(
                model, device, frame,
                conf_thres=config.get("conf_thres", 0.25),
                iou_thres=config.get("iou_thres", 0.45)
            )
        except Exception as e:
            log("warning", f"Erro na inferência: {e}")
            detections = []

        # 2.5 Active Continuous Learning com Google Gemini 2.0 Flash
        if active_learner:
            if active_learner.should_sample(detections):
                active_learner.submit_frame_for_learning(frame, reason="bot_runtime")

            if not detections:
                oracle_dets = active_learner.get_latest_oracle_detections()
                if oracle_dets:
                    for od in oracle_dets:
                        detections.append({
                            "class_id": 0,
                            "confidence": od["confidence"],
                            "bbox": od["bbox"],
                            "rel_center": od["rel_center"],
                        })
                    log("vision", "🔮 Oráculo Gemini auxiliou o bot com alvo detectado pela IA em nuvem!")

        t_inf = time.time()

        fps_capture = round(1.0 / max(0.001, t_cap - loop_start), 1)
        fps_inference = round(1.0 / max(0.001, t_inf - t_cap), 1)

        # 3. Policy & Actions
        action_name, keys, action_msg, n_coins, n_players = execute_policy(
            detections, class_names, config, frame.shape
        )

        # 4. Emit Detections & Actions
        formatted_dets = []
        for d in detections:
            cid = d["class_id"]
            name = class_names[cid] if cid < len(class_names) else "object"
            formatted_dets.append({
                "label": name,
                "confidence": d["confidence"],
                "bbox": d["bbox"],
                "rel_center": d["rel_center"]
            })

        emit("detection",
             objects=formatted_dets,
             fps_capture=fps_capture,
             fps_inference=fps_inference,
             detected_coins=n_coins,
             detected_players=n_players,
             timestamp=time.time()
        )

        if action_name != "idle":
            emit("action",
                 action=action_name,
                 keys=keys,
                 message=action_msg,
                 simulation=config.get("simulation_mode", True)
            )
            if random.random() < 0.2 or action_name in ["collect_coin", "flee_player"]:
                log("movement" if action_name != "flee_player" else "warning", action_msg)

        # 5. Optional Preview Frame
        now = time.time()
        if config.get("send_preview", True) and (now - last_preview_time) >= preview_interval:
            last_preview_time = now
            try:
                import cv2
                # Draw boxes on preview
                h, w = frame.shape[:2]
                scale = 480 / max(h, w)
                pv_w, pv_h = int(w * scale), int(h * scale)
                pv_img = cv2.resize(frame, (pv_w, pv_h))

                for d in formatted_dets:
                    x1, y1, x2, y2 = [int(v * scale) for v in d["bbox"]]
                    color = (0, 220, 255) if "coin" in d["label"].lower() else (50, 50, 255)
                    cv2.rectangle(pv_img, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(
                        pv_img,
                        f"{d['label'].upper()} {int(d['confidence']*100)}%",
                        (x1, max(15, y1 - 5)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.45,
                        color,
                        1,
                        cv2.LINE_AA
                    )

                # Convert RGB to BGR for opencv encoding
                bgr = cv2.cvtColor(pv_img, cv2.COLOR_RGB2BGR)
                _, buffer = cv2.imencode(".jpg", bgr, [cv2.IMWRITE_JPEG_QUALITY, 60])
                b64 = base64.b64encode(buffer).decode("utf-8")
                emit("preview_frame", data=f"data:image/jpeg;base64,{b64}")
            except Exception as e:
                pass

        # Throttle loop to prevent 100% CPU spinning if capture is too fast
        time.sleep(0.01)

    input_controller.release_all()
    stop_active_learning()
    log("info", "Bot foi descansar 💗")
    emit("status", state="stopped", message="Bot finalizado")

# Stdin command listener
def stdin_listener():
    global running, paused, config, worker_thread

    while True:
        line = sys.stdin.readline()
        if not line:
            break
        line = line.strip()
        if not line:
            continue
        try:
            cmd = json.loads(line)
            cmd_type = cmd.get("type", "").upper()

            if cmd_type == "START":
                # Garante restart limpo se o worker anterior ainda estiver vivo
                if running:
                    running = False
                    paused = False
                    input_controller.release_all()
                    stop_active_learning()
                    if worker_thread and worker_thread.is_alive():
                        worker_thread.join(timeout=2.0)

                if "bot_id" in cmd:
                    config["bot_id"] = cmd["bot_id"]
                if "config" in cmd and isinstance(cmd["config"], dict):
                    config.update(cmd["config"])
                running = True
                paused = False
                emit("status", state="initializing", message="Comando START recebido, subindo worker...")
                worker_thread = threading.Thread(target=bot_worker, daemon=True)
                worker_thread.start()

            elif cmd_type == "STOP":
                running = False
                paused = False
                input_controller.release_all()
                stop_active_learning()
                if worker_thread and worker_thread.is_alive():
                    worker_thread.join(timeout=1.5)
                emit("status", state="stopped", message="Bot parado")
                log("info", "STOP recebido — worker encerrado")

            elif cmd_type == "PAUSE":
                paused = True
                input_controller.release_all()
                emit("status", state="paused", message="Bot pausado")
                log("info", "Bot pausado temporariamente")

            elif cmd_type == "RESUME":
                paused = False
                emit("status", state="running", message="Bot retomado")
                log("info", "Bot retomado")

            elif cmd_type == "CONFIG_UPDATE":
                if "config" in cmd and isinstance(cmd["config"], dict):
                    config.update(cmd["config"])
                    global _cached_roblox_hwnd
                    _cached_roblox_hwnd = None
                    log("info", f"🎯 Alvo de captura atualizado: {config.get('window_title', 'Roblox')} ({config.get('capture_mode', 'auto')})")

            elif cmd_type == "PING":
                emit("pong", timestamp=time.time())

        except Exception as e:
            log("error", f"Erro no comando stdin: {e}")

if __name__ == "__main__":
    listener = threading.Thread(target=stdin_listener, daemon=True)
    listener.start()
    listener.join()
