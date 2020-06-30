use std::collections::HashMap;

use super::gamemaster::GameMaster;
use super::matchmaking::Matchmaker;
use super::{Player, PlayerId, PlayerToken};

#[derive(Debug, Clone)]
pub struct BattleFun {
    pub players: HashMap<PlayerId, Player>,
    pub player_tokens: HashMap<PlayerToken, PlayerId>,
    pub gamemaster: GameMaster,
    pub matchmaker: Matchmaker,
}

impl BattleFun {
    pub fn new() -> Self {
        Self {
            players: HashMap::new(),
            player_tokens: HashMap::new(),
            gamemaster: GameMaster::new(),
            matchmaker: Matchmaker::new(),
        }
    }
}
