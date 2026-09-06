import sys
import time
import numpy as np
from typing import Optional, Tuple
from .types import Frame

def _ensure_interactive_desktop():
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

class CaptureEngine:
    def __init__(self, mode: str = "auto", region: Optional[Tuple[int, int, int, int]] = None, window_title: str = "Roblox", monitor_index: int = 0):
        self.mode = mode
        self.region = region
        self.window_title = window_title
        self.monitor_index = monitor_index
        self._cached_hwnd = None

        _ensure_interactive_desktop()
        try:
            from ctypes import windll
            windll.user32.SetProcessDPIAware()
        except Exception:
            pass

    def _find_target_hwnd(self) -> Optional[int]:
        if self._cached_hwnd:
            try:
                import win32gui
                if win32gui.IsWindow(self._cached_hwnd) and win32gui.IsWindowVisible(self._cached_hwnd):
                    return self._cached_hwnd
            except Exception:
                pass

        _ensure_interactive_desktop()
        self._cached_hwnd = None
        try:
            import win32gui
            hwnds = []
            def enum_cb(h, _):
                if win32gui.IsWindowVisible(h):
                    t = win32gui.GetWindowText(h)
                    if t and self.window_title.lower() in t.lower():
                        rect = win32gui.GetWindowRect(h)
                        w = rect[2] - rect[0]
                        h_sz = rect[3] - rect[1]
                        if w > 100 and h_sz > 100:
                            hwnds.append((h, w * h_sz))
            win32gui.EnumWindows(enum_cb, None)
            if hwnds:
                hwnds.sort(key=lambda x: x[1], reverse=True)
                self._cached_hwnd = hwnds[0][0]
                return self._cached_hwnd
        except Exception:
            pass
        return None

    def capture_frame(self) -> Optional[Frame]:
        now = time.time()
        _ensure_interactive_desktop()

        # 1. PrintWindow direto na janela alvo
        hwnd = self._find_target_hwnd()
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

                        if self.region and len(self.region) == 4:
                            rx, ry, rw, rh = self.region
                            rgb = rgb[ry:ry+rh, rx:rx+rw]

                        fh, fw = rgb.shape[:2]
                        return Frame(timestamp=now, width=fw, height=fh, image=rgb, monitor=self.monitor_index, region=self.region)

                    gdi32.DeleteObject(hbitmap)
                    gdi32.DeleteDC(mem_dc)
                    user32.ReleaseDC(hwnd, hwnd_dc)
            except Exception:
                pass

        # 2. Fallback via MSS
        try:
            import mss
            with mss.mss() as sct:
                mon = sct.monitors[1] if len(sct.monitors) > 1 else sct.monitors[0]
                if self.region and len(self.region) == 4:
                    rx, ry, rw, rh = self.region
                    shot = sct.grab({"top": int(ry), "left": int(rx), "width": int(rw), "height": int(rh)})
                else:
                    shot = sct.grab(mon)
                arr = np.array(shot)
                rgb = arr[:, :, [2, 1, 0]]
                fh, fw = rgb.shape[:2]
                return Frame(timestamp=now, width=fw, height=fh, image=rgb, monitor=self.monitor_index, region=self.region)
        except Exception:
            pass

        # 3. Fallback via PIL.ImageGrab
        try:
            from PIL import ImageGrab
            if self.region and len(self.region) == 4:
                x, y, w, h = self.region
                img = ImageGrab.grab(bbox=(int(x), int(y), int(x + w), int(y + h)))
            else:
                img = ImageGrab.grab()
            img_np = np.array(img)
            h, w = img_np.shape[:2]
            return Frame(timestamp=now, width=w, height=h, image=img_np, monitor=self.monitor_index, region=self.region)
        except Exception:
            return None
