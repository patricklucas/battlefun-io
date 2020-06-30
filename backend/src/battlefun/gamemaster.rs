use super::{PlayerId, ShipPlacement};

#[derive(Debug, Clone)]
pub struct GameMaster {}

impl GameMaster {
    pub fn new() -> Self {
        Self {}
    }

    pub fn start_game(
        &self,
        player1_id: PlayerId,
        player1_ships: ShipPlacement,
        player2_id: PlayerId,
        player2_ships: ShipPlacement,
    ) {
        eprintln!(
            "Start game with {} ({:?}) and {} ({:?})",
            player1_id, player1_ships, player2_id, player2_ships
        );
    }
}
