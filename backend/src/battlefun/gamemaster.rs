use super::PlayerId;

#[derive(Debug, Clone)]
pub struct GameMaster {}

impl GameMaster {
    pub fn new() -> Self {
        Self {}
    }

    pub fn start_game(&self, player1_id: PlayerId, player2_id: PlayerId) {
        eprintln!("Start game with {} and {}", player1_id, player2_id);
    }
}
