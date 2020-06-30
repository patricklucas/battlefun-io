use super::{CellIndex, GameId, PlayerId, ShipPlacement};
use crate::error::Error;
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
        let game_id = GameId::new_v4();

        eprintln!(
            "Start game {} with {} ({:?}) and {} ({:?})",
            game_id, player1_id, player1_ships, player2_id, player2_ships
        );

        self.games
            .insert(game_id, GameInfo::new(player1_id, player2_id));
    }

    pub fn turn(
        &mut self,
        game_id: GameId,
        player_id: PlayerId,
        cell: CellIndex,
    ) -> Result<(), Error> {
        match self.games.get(&game_id) {
            Some(game_info) => {
                if player_id != game_info.player1_id && player_id != game_info.player2_id {
                    return Err(Error::InvalidArgument("Invalid player".to_owned()));
                }
            }
            None => return Err(Error::NoSuchGame(game_id)),
        };

        eprintln!(
            "Game {}: player {} took a shot @ {}",
            game_id, player_id, cell
        );

        Ok(())
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
