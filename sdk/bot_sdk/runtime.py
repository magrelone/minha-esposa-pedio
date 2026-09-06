import sys
import json
import time
from typing import Optional
from .types import BotState, BotContext
from .capture import CaptureEngine
from .vision import VisionEngine
from .decision import DecisionEngine, BotStrategy
from .input import InputEngine

class BotRuntime:
    def __init__(self, bot_id: str, strategy: BotStrategy, vision_engine: VisionEngine, capture_engine: CaptureEngine, input_engine: InputEngine):
        self.bot_id = bot_id
        self.strategy = strategy
        self.vision = vision_engine
        self.capture = capture_engine
        self.input = input_engine
        self.decision = DecisionEngine(strategy)

        self.state = BotState.IDLE
        self.running = False
        self.paused = False
        self.start_time = 0.0

    def emit(self, msg_type: str, **kwargs):
        payload = {"type": msg_type, **kwargs}
        try:
            sys.stdout.write(json.dumps(payload, ensure_ascii=False) + "\n")
            sys.stdout.flush()
        except Exception:
            pass

    def log(self, level: str, message: str):
        self.emit("log", level=level, message=message, time=time.strftime("%H:%M:%S"))

    def run_step(self) -> bool:
        if self.paused:
            self.input.release_all()
            time.sleep(0.1)
            return True

        t0 = time.time()
        frame = self.capture.capture_frame()
        if frame is None:
            time.sleep(0.1)
            return True

        t_cap = time.time()
        detections = self.vision.detect(frame.image)
        t_inf = time.time()

        fps_capture = round(1.0 / max(0.001, t_cap - t0), 1)
        fps_inference = round(1.0 / max(0.001, t_inf - t_cap), 1)

        ctx = BotContext(
            bot_id=self.bot_id,
            state=self.state,
            uptime_secs=round(time.time() - self.start_time, 1),
            fps_capture=fps_capture,
            fps_inference=fps_inference,
            detected_coins=len([d for d in detections if "coin" in d.class_name.lower()]),
            detected_players=len([d for d in detections if "person" in d.class_name.lower() or "player" in d.class_name.lower()]),
        )

        actions = self.decision.process(detections, ctx)
        self.input.execute_actions(actions)

        # Emit telemetry
        self.emit("detection",
            objects=[{
                "label": d.class_name,
                "confidence": d.confidence,
                "bbox": d.bbox,
                "rel_center": d.rel_center
            } for d in detections],
            fps_capture=fps_capture,
            fps_inference=fps_inference,
            detected_coins=ctx.detected_coins,
            detected_players=ctx.detected_players,
            timestamp=time.time()
        )

        if actions:
            first_action = actions[0]
            self.emit("action",
                action=first_action.action_type.value,
                keys=[a.payload.get("key") for a in actions if a.payload.get("key")],
                message=first_action.message,
                simulation=self.input.simulation_mode
            )

        return True

    def start(self):
        self.running = True
        self.paused = False
        self.start_time = time.time()
        self.state = BotState.SEARCHING
        self.log("info", "Bot SDK Runtime iniciado com sucesso 🧸")
        self.emit("status", state="running")

    def stop(self):
        self.running = False
        self.paused = False
        self.state = BotState.STOPPED
        self.input.release_all()
        self.log("info", "Bot SDK Runtime parado 💗")
        self.emit("status", state="stopped")
