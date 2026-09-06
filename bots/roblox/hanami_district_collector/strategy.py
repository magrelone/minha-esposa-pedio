import time
import random
from typing import List, Optional
from sdk.bot_sdk.decision import BotStrategy
from sdk.bot_sdk.navigation import NavigationEngine
from sdk.bot_sdk.types import Detection, Action, ActionType, BotContext

class HanamiSpiritCollectorStrategy(BotStrategy):
    """
    Estratégia autônoma para o jogo 'Distrito de Hanami (Roblox)'.
    Suporta coleta de Espíritos Brancos (Sakura) e Pretos (Kuro),
    gerenciando o delay obrigatório de 3 segundos de permanência para absorção.
    """

    def __init__(
        self,
        mode: str = "all_spirits",  # "all_spirits", "white_only", "black_only"
        dwell_time_seconds: float = 3.2,
        jump_on_stuck: bool = True,
        interaction_threshold: float = 0.18,  # distância relativa considerada 'em alcance de coleta'
    ):
        super().__init__()
        self.mode = mode
        self.dwell_time_seconds = dwell_time_seconds
        self.jump_on_stuck = jump_on_stuck
        self.interaction_threshold = interaction_threshold
        self.navigation = NavigationEngine(char_x=0.5, char_y=0.75)

        # Estado interno de coleta
        self.current_state = "PATROL"  # "PATROL", "APPROACHING", "COLLECTING"
        self.collecting_start_time: Optional[float] = None
        self.last_target_id: Optional[str] = None
        self.last_state_change: float = time.time()
        self.current_waypoint_idx = 0

    def decide(self, detections: List[Detection], context: BotContext) -> List[Action]:
        now = time.time()

        # 1. Filtra espíritos conforme modo configurado
        spirits = []
        for d in detections:
            cname = d.class_name.lower()
            if self.mode == "white_only" and "white" in cname:
                spirits.append(d)
            elif self.mode == "black_only" and "black" in cname:
                spirits.append(d)
            elif self.mode == "all_spirits" and ("spirit" in cname or "cat" in cname or "bixinho" in cname or "white" in cname or "black" in cname):
                spirits.append(d)

        # 2. Máquina de Estados de Coleta (Delay de 3 segundos)
        if self.current_state == "COLLECTING":
            elapsed = now - (self.collecting_start_time or now)
            if elapsed < self.dwell_time_seconds:
                remaining = round(self.dwell_time_seconds - elapsed, 1)
                return [
                    Action(
                        ActionType.WAIT,
                        duration=0.2,
                        message=f"🌸 Absorvendo espírito em Hanami... restam {remaining}s"
                    )
                ]
            else:
                # Coleta concluída!
                self.current_state = "PATROL"
                self.collecting_start_time = None
                return [
                    Action(
                        ActionType.WAIT,
                        duration=0.3,
                        message="✨ Espírito coletado com sucesso! Retomando patrulha."
                    )
                ]

        # 3. Se avistou espíritos na tela, aproxima-se do mais central/próximo
        if spirits:
            target = self.target_selector.closest_to_center(spirits)
            dx = abs(target.bbox[0] + target.bbox[2] / 2.0 - 0.5)
            dy = abs(target.bbox[1] + target.bbox[3] / 2.0 - 0.75)
            dist = (dx**2 + dy**2) ** 0.5

            # Se já está encostado / em raio de coleta (< threshold), inicia o dwell timer de 3s
            if dist <= self.interaction_threshold:
                self.current_state = "COLLECTING"
                self.collecting_start_time = now
                target_kind = "Branco 🤍" if "white" in target.class_name.lower() else "Preto 🖤"
                return [
                    Action(
                        ActionType.WAIT,
                        duration=0.25,
                        message=f"🐾 Em contato com Espírito {target_kind}! Iniciando absorção (3s)..."
                    )
                ]

            # Caso contrário, caminha na direção dele
            self.current_state = "APPROACHING"
            actions = self.navigation.move_towards(target)
            return actions

        # 4. Modo Patrulha: segue rota pelos waypoints do mapa estático
        self.current_state = "PATROL"
        patrol_actions = [
            Action(
                ActionType.MOVE_FORWARD,
                duration=0.6,
                message="🌸 Patrulhando Alameda de Hanami à procura de espíritos..."
            )
        ]

        if self.jump_on_stuck and random.random() < 0.08:
            patrol_actions.append(Action(ActionType.JUMP, payload={"key": "space"}))

        return patrol_actions
