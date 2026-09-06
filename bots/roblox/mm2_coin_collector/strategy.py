import random
from typing import List
from sdk.bot_sdk.decision import BotStrategy
from sdk.bot_sdk.navigation import NavigationEngine
from sdk.bot_sdk.types import Detection, Action, ActionType, BotContext

class MM2CoinCollectorStrategy(BotStrategy):
    def __init__(self, mode: str = "coin_only", jump_prob: float = 0.1, run_away_prob: float = 1.0):
        super().__init__()
        self.mode = mode
        self.jump_prob = jump_prob
        self.run_away_prob = run_away_prob
        self.navigation = NavigationEngine(char_x=0.5, char_y=0.75)

    def decide(self, detections: List[Detection], context: BotContext) -> List[Action]:
        players = [d for d in detections if "person" in d.class_name.lower() or "player" in d.class_name.lower()]
        coins = [d for d in detections if "coin" in d.class_name.lower()]

        # Flee from players if in coin_and_players mode
        if self.mode == "coin_and_players" and players and (self.run_away_prob >= 1.0 or random.random() < self.run_away_prob):
            closest_player = self.target_selector.closest_to_center(players)
            actions = self.navigation.move_away_from(closest_player)
            if self.jump_prob > 0 and random.random() < self.jump_prob:
                actions.append(Action(ActionType.JUMP, payload={"key": "space"}))
            return actions

        # Collect coins
        if coins:
            target_coin = self.target_selector.closest_to_center(coins)
            actions = self.navigation.move_towards(target_coin)
            if random.random() < self.jump_prob:
                actions.append(Action(ActionType.JUMP, payload={"key": "space"}))
            return actions

        # Exploration when idle
        rand_action = random.choice([
            ActionType.MOVE_FORWARD,
            ActionType.MOVE_BACKWARD,
            ActionType.MOVE_LEFT,
            ActionType.MOVE_RIGHT,
        ])
        return [Action(rand_action, message="Explorando área em busca de moedas")]
