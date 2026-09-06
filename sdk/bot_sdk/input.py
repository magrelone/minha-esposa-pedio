import time
from typing import List, Set, Optional, Tuple
from .types import Action, ActionType

class ActionQueue:
    def __init__(self):
        self.queue: List[Action] = []

    def push(self, action: Action):
        self.queue.append(action)

    def pop(self) -> Optional[Action]:
        if self.queue:
            return self.queue.pop(0)
        return None

    def clear(self):
        self.queue.clear()


class BaseInputDriver:
    def press(self, key: str): pass
    def release(self, key: str): pass
    def release_all(self): pass

class MockInputDriver(BaseInputDriver):
    def __init__(self):
        self.recorded_actions: List[Tuple[str, str]] = []
        self.pressed_keys: Set[str] = set()

    def press(self, key: str):
        self.pressed_keys.add(key)
        self.recorded_actions.append(("press", key))

    def release(self, key: str):
        if key in self.pressed_keys:
            self.pressed_keys.remove(key)
        self.recorded_actions.append(("release", key))

    def release_all(self):
        self.pressed_keys.clear()
        self.recorded_actions.append(("release_all", ""))

class SafePynputDriver(BaseInputDriver):
    def __init__(self):
        self.keyboard = None
        self.active_keys: Set[str] = set()
        try:
            from pynput.keyboard import Controller
            self.keyboard = Controller()
        except Exception:
            pass

    def press(self, key: str):
        if not self.keyboard:
            return
        try:
            self.active_keys.add(key)
            self.keyboard.press(key)
        except Exception:
            pass

    def release(self, key: str):
        if not self.keyboard:
            return
        try:
            if key in self.active_keys:
                self.active_keys.remove(key)
            self.keyboard.release(key)
        except Exception:
            pass

    def release_all(self):
        if not self.keyboard:
            self.active_keys.clear()
            return
        for k in list(self.active_keys):
            try:
                self.keyboard.release(k)
            except Exception:
                pass
        self.active_keys.clear()

class InputEngine:
    ACTION_KEY_MAP = {
        ActionType.MOVE_FORWARD: "w",
        ActionType.MOVE_BACKWARD: "s",
        ActionType.MOVE_LEFT: "a",
        ActionType.MOVE_RIGHT: "d",
        ActionType.JUMP: "space",
    }

    def __init__(self, simulation_mode: bool = True):
        self.simulation_mode = simulation_mode
        self.driver: BaseInputDriver = MockInputDriver() if simulation_mode else SafePynputDriver()

    def set_simulation_mode(self, simulation: bool):
        self.simulation_mode = simulation
        self.driver.release_all()
        self.driver = MockInputDriver() if simulation else SafePynputDriver()

    def execute_actions(self, actions: List[Action]):
        self.driver.release_all()
        for a in actions:
            key = a.payload.get("key") or self.ACTION_KEY_MAP.get(a.action_type)
            if key:
                self.driver.press(key)

    def release_all(self):
        self.driver.release_all()
