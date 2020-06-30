use super::gamemaster;
use crate::PlayerId;

#[derive(Debug, Clone)]
pub struct Matchmaker {
    gamemaster: gamemaster::GameMaster,
    waiting_player_id: Option<PlayerId>,
}

impl Matchmaker {
    pub fn new() -> Self {
        Self {
            gamemaster: gamemaster::GameMaster {},
            waiting_player_id: None,
        }
    }

    pub fn play(&mut self, new_player_id: PlayerId) {
        if let Some(waiting_player_id) = self.waiting_player_id {
            self.gamemaster.start_game(waiting_player_id, new_player_id);
            self.waiting_player_id = None;
        } else {
            self.waiting_player_id = Some(new_player_id);
        }
    }
}
