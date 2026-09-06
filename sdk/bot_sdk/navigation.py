from typing import List, Tuple
from .types import Detection, Action, ActionType

class NavigationEngine:
    def __init__(self, char_x: float = 0.5, char_y: float = 0.75, deadzone: float = 0.03):
        self.char_x = char_x
        self.char_y = char_y
        self.deadzone = deadzone

    def move_towards(self, target: Detection, jump_prob: float = 0.0) -> List[Action]:
        actions: List[Action] = []
        tx, ty = target.rel_center
        dx = tx - self.char_x
        dy = ty - self.char_y

        if dx > self.deadzone:
            actions.append(Action(ActionType.MOVE_RIGHT, payload={"key": "d"}, message="Movendo para a direita"))
        elif dx < -self.deadzone:
            actions.append(Action(ActionType.MOVE_LEFT, payload={"key": "a"}, message="Movendo para a esquerda"))

        if dy > self.deadzone:
            actions.append(Action(ActionType.MOVE_BACKWARD, payload={"key": "s"}, message="Movendo para trás"))
        elif dy < -self.deadzone:
            actions.append(Action(ActionType.MOVE_FORWARD, payload={"key": "w"}, message="Movendo para frente"))

        return actions

    def move_away_from(self, target: Detection) -> List[Action]:
        actions: List[Action] = []
        tx, ty = target.rel_center
        dx = tx - self.char_x
        dy = ty - self.char_y

        if dx > 0:
            actions.append(Action(ActionType.MOVE_LEFT, payload={"key": "a"}, message="Fugindo para a esquerda"))
        elif dx < 0:
            actions.append(Action(ActionType.MOVE_RIGHT, payload={"key": "d"}, message="Fugindo para a direita"))

        if dy > 0:
            actions.append(Action(ActionType.MOVE_FORWARD, payload={"key": "w"}, message="Fugindo para frente"))
        elif dy < 0:
            actions.append(Action(ActionType.MOVE_BACKWARD, payload={"key": "s"}, message="Fugindo para trás"))

        return actions
