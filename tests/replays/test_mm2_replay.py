import unittest
import numpy as np
from sdk.bot_sdk.types import Detection, BotContext, BotState, ActionType
from sdk.bot_sdk.input import InputEngine, MockInputDriver
from bots.roblox.mm2_coin_collector.strategy import MM2CoinCollectorStrategy

class TestMM2Replay(unittest.TestCase):
    def setUp(self):
        self.strategy = MM2CoinCollectorStrategy(mode="coin_and_players")
        self.input_engine = InputEngine(simulation_mode=True)
        self.mock_driver = self.input_engine.driver

    def test_replays_coin_collection_when_coin_on_right(self):
        ctx = BotContext("roblox.mm2", BotState.SEARCHING, 10.0, 30.0, 25.0)
        # Coin placed at x=0.75, y=0.75 (to the right of char xc=0.5, yc=0.75)
        coin = Detection(0, "coin", 0.94, (400, 400, 450, 450), (0.75, 0.75), 50, 50)

        actions = self.strategy.decide([coin], ctx)
        self.input_engine.execute_actions(actions)

        # Expected right movement (key 'd')
        self.assertIn("d", self.mock_driver.pressed_keys)

    def test_replays_player_avoidance_when_murderer_approaches(self):
        ctx = BotContext("roblox.mm2", BotState.SEARCHING, 10.0, 30.0, 25.0)
        # Player approaching from right (x=0.8, y=0.75)
        player = Detection(1, "person", 0.92, (450, 400, 500, 550), (0.8, 0.75), 50, 150)

        actions = self.strategy.decide([player], ctx)
        self.input_engine.execute_actions(actions)

        # Expected to flee to the left (key 'a')
        self.assertIn("a", self.mock_driver.pressed_keys)

if __name__ == "__main__":
    unittest.main()
