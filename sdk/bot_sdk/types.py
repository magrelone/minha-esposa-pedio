from dataclasses import dataclass, field
from enum import Enum
from typing import List, Tuple, Dict, Any, Optional
import numpy as np

class ActionType(str, Enum):
    MOVE_FORWARD = "MOVE_FORWARD"
    MOVE_BACKWARD = "MOVE_BACKWARD"
    MOVE_LEFT = "MOVE_LEFT"
    MOVE_RIGHT = "MOVE_RIGHT"
    JUMP = "JUMP"
    LOOK_LEFT = "LOOK_LEFT"
    LOOK_RIGHT = "LOOK_RIGHT"
    WAIT = "WAIT"
    CUSTOM = "CUSTOM"
    EXPLORE = "EXPLORE"

class BotState(str, Enum):
    IDLE = "IDLE"
    INITIALIZING = "INITIALIZING"
    SEARCHING = "SEARCHING"
    TARGET_FOUND = "TARGET_FOUND"
    MOVING = "MOVING"
    ACTION = "ACTION"
    RECOVERING = "RECOVERING"
    PAUSED = "PAUSED"
    STOPPING = "STOPPING"
    STOPPED = "STOPPED"
    ERROR = "ERROR"

@dataclass
class Detection:
    class_id: int
    class_name: str
    confidence: float
    bbox: Tuple[float, float, float, float]  # [x1, y1, x2, y2]
    rel_center: Tuple[float, float]          # [cx, cy] normalized [0.0, 1.0]
    width: float
    height: float

@dataclass
class Frame:
    timestamp: float
    width: int
    height: int
    image: np.ndarray
    monitor: int = 0
    region: Optional[Tuple[int, int, int, int]] = None

@dataclass
class Action:
    action_type: ActionType
    payload: Dict[str, Any] = field(default_factory=dict)
    duration: float = 0.25
    priority: int = 1
    message: str = ""

@dataclass
class BotContext:
    bot_id: str
    state: BotState
    uptime_secs: float
    fps_capture: float
    fps_inference: float
    detected_coins: int = 0
    detected_players: int = 0
    last_action: Optional[str] = None
    custom_data: Dict[str, Any] = field(default_factory=dict)

@dataclass
class TrainingProfile:
    name: str
    image_size: int = 640
    batch_size: int = 12
    epochs: int = 100
    initial_weights: str = "yolov5m.pt"
    device: str = "auto"
    workers: int = 4
