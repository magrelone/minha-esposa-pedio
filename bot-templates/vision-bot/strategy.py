from typing import List
from sdk.bot_sdk.decision import BotStrategy
from sdk.bot_sdk.navigation import NavigationEngine
from sdk.bot_sdk.types import Detection, Action, ActionType, BotContext

class TemplateVisionStrategy(BotStrategy):
    def __init__(self, target_class: str = "target"):
        super().__init__()
        self.target_class = target_class
        self.navigation = NavigationEngine()

    def decide(self, detections: List[Detection], context: BotContext) -> List[Action]:
        targets = [d for d in detections if d.class_name.lower() == self.target_class.lower()]
        if not targets:
            return [Action(ActionType.EXPLORE, message="Explorando área em busca do alvo")]

        best_target = self.target_selector.closest_to_center(targets)
        return self.navigation.move_towards(best_target)
