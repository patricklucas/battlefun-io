use super::{gamemaster::GameMaster, PlayerId, ShipPlacement};

#[derive(Debug, Clone)]
pub struct Matchmaker {
    gamemaster: GameMaster,
    waiting_player: Option<WaitingPlayer>,
}

impl Matchmaker {
    pub fn new() -> Self {
        Self {
            gamemaster: GameMaster {},
            waiting_player: None,
        }
    }

    pub fn play(&mut self, new_player_id: PlayerId, new_player_ships: ShipPlacement) {
        if let Some(waiting_player) = self.waiting_player.take() {
            self.gamemaster.start_game(
                waiting_player.id,
                waiting_player.ships,
                new_player_id,
                new_player_ships,
            );
            self.waiting_player = None;
        } else {
            self.waiting_player = Some(WaitingPlayer {
                id: new_player_id,
                ships: new_player_ships,
            });
        }
    }
}

#[derive(Debug, Clone)]
struct WaitingPlayer {
    id: PlayerId,
    ships: ShipPlacement,
}
