import math
from abc import ABC, abstractmethod
from typing import List, Optional
from .types import Detection, Action, BotContext

class TargetSelector:
    @staticmethod
    def closest_to_center(detections: List[Detection], center_x: float = 0.5, center_y: float = 0.75) -> Optional[Detection]:
        if not detections:
            return None
        return min(
            detections,
            key=lambda d: math.hypot(d.rel_center[0] - center_x, d.rel_center[1] - center_y)
        )

    @staticmethod
    def highest_confidence(detections: List[Detection]) -> Optional[Detection]:
        if not detections:
            return None
        return max(detections, key=lambda d: d.confidence)

    @staticmethod
    def nearest_screen_bottom(detections: List[Detection]) -> Optional[Detection]:
        if not detections:
            return None
        return max(detections, key=lambda d: d.rel_center[1])

class BotStrategy(ABC):
    def __init__(self):
        self.target_selector = TargetSelector()

    @abstractmethod
    def decide(self, detections: List[Detection], context: BotContext) -> List[Action]:
        pass

class DecisionEngine:
    def __init__(self, strategy: BotStrategy):
        self.strategy = strategy

    def process(self, detections: List[Detection], context: BotContext) -> List[Action]:
        return self.strategy.decide(detections, context)
