use super::{GameId, PlayerId, ShipPlacement};
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct GameMaster {
    games: HashMap<GameId, GameInfo>,
}

impl GameMaster {
    pub fn new() -> Self {
        Self {
            games: HashMap::new(),
        }
    }

    pub fn start_game(
        &mut self,
        player1_id: PlayerId,
        player1_ships: ShipPlacement,
        player2_id: PlayerId,
        player2_ships: ShipPlacement,
    ) {
        eprintln!(
            "Start game with {} ({:?}) and {} ({:?})",
            player1_id, player1_ships, player2_id, player2_ships
        );

        let game_id = GameId::new_v4();
        self.games
            .insert(game_id, GameInfo::new(player1_id, player2_id));
    }
}

#[derive(Debug, Clone)]
struct GameInfo {
    player1_id: PlayerId,
    player2_id: PlayerId,
}

impl GameInfo {
    pub fn new(player1_id: PlayerId, player2_id: PlayerId) -> Self {
        Self {
            player1_id,
            player2_id,
        }
    }
}
