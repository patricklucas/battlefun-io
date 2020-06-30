use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

use super::gamemaster::GameMaster;
use super::matchmaking::Matchmaker;
use super::{Player, PlayerId, PlayerToken};

#[derive(Debug, Clone)]
pub struct BattleFun {
    pub players: HashMap<PlayerId, Player>,
    pub player_tokens: HashMap<PlayerToken, PlayerId>,
    pub gamemaster: Arc<RwLock<GameMaster>>,
    pub matchmaker: Matchmaker,
}

impl BattleFun {
    pub fn new() -> Self {
        let gamemaster = Arc::new(RwLock::new(GameMaster::new()));

        Self {
            players: HashMap::new(),
            player_tokens: HashMap::new(),
            gamemaster: gamemaster.clone(),
            matchmaker: Matchmaker::new(gamemaster.clone()),
        }
    }
}
