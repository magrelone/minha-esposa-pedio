import os
import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from sdk.bot_sdk.runtime import BotRuntime
from sdk.bot_sdk.vision import VisionEngine
from sdk.bot_sdk.capture import CaptureEngine
from sdk.bot_sdk.input import InputEngine
from config import CONFIG
from strategy import TemplateVisionStrategy

def main():
    vision = VisionEngine()
    if CONFIG["model_path"]:
        vision.load_model(CONFIG["model_path"], device=CONFIG["device"])

    capture = CaptureEngine(window_title=CONFIG["window_title"])
    input_eng = InputEngine(simulation_mode=CONFIG["simulation_mode"])
    strategy = TemplateVisionStrategy(target_class=CONFIG["target_class"])

    runtime = BotRuntime(
        bot_id="template.vision.bot",
        strategy=strategy,
        vision_engine=vision,
        capture_engine=capture,
        input_engine=input_eng
    )

    runtime.start()
    try:
        while runtime.running:
            runtime.run_step()
    finally:
        runtime.stop()

if __name__ == "__main__":
    main()
