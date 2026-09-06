import unittest
import sys
import os

# Add template root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sdk.bot_sdk.types import Detection, BotContext, BotState, ActionType
from strategy import TemplateVisionStrategy

class TestTemplateStrategy(unittest.TestCase):
    def test_explores_when_no_targets(self):
        strategy = TemplateVisionStrategy(target_class="target")
        ctx = BotContext("test", BotState.SEARCHING, 0.0, 30.0, 25.0)
        actions = strategy.decide([], ctx)
        self.assertEqual(len(actions), 1)
        self.assertEqual(actions[0].action_type, ActionType.EXPLORE)

    def test_moves_towards_target_on_right(self):
        strategy = TemplateVisionStrategy(target_class="target")
        ctx = BotContext("test", BotState.SEARCHING, 0.0, 30.0, 25.0)
        det = Detection(0, "target", 0.95, (300, 200, 350, 250), (0.75, 0.75), 50, 50)
        actions = strategy.decide([det], ctx)
        self.assertTrue(any(a.action_type == ActionType.MOVE_RIGHT for a in actions))

if __name__ == "__main__":
    unittest.main()
