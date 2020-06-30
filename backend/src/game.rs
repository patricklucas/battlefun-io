use crate::PlayerId;
use serde::Serialize;
use std::collections::HashMap;

type ShipPlacement = HashMap<String, Vec<u8>>;
type Shots = Vec<u8>;

#[derive(Serialize, Debug)]
pub struct GameState {
    pub current_state: String,
    pub player1_turn: bool,

    pub player1_id: PlayerId,
    pub player1_shots: Shots,
    pub player1_ships: ShipPlacement,

    pub player2_id: PlayerId,
    pub player2_ships: ShipPlacement,
    pub player2_shots: Shots,
}

impl GameState {
    pub fn new(
        player1_id: PlayerId,
        player1_ships: ShipPlacement,
        player2_id: PlayerId,
        player2_ships: ShipPlacement,
    ) -> Self {
        Self {
            current_state: "IN_PROGRESS".to_string(),
            player1_turn: true,

            player1_id: player1_id,
            player1_shots: Vec::new(),
            player1_ships: player1_ships,

            player2_id: player2_id,
            player2_ships: player2_ships,
            player2_shots: Vec::new(),
        }
    }

    pub fn get_player_game_state(
        &self,
        player_id: PlayerId,
    ) -> Result<PlayerGameState, &'static str> {
        if self.player1_id == player_id {
            let player_game_state = PlayerGameState {
                opponent_id: self.player2_id,
                current_state: self.current_state.clone(),
                your_turn: self.player1_turn,
                your_shots: self.player1_shots.clone(),
                opponent_shots: self.player2_shots.clone(),
                destroyed_opponent_ships: get_destroyed_ships(
                    &self.player2_ships,
                    &self.player1_shots,
                ),
                your_ships: self.player1_ships.clone(),
            };

            return Ok(player_game_state);
        }

        if self.player2_id == player_id {
            let player_game_state = PlayerGameState {
                opponent_id: self.player1_id,
                current_state: self.current_state.clone(),
                your_turn: !self.player1_turn,
                your_shots: self.player2_shots.clone(),
                opponent_shots: self.player1_shots.clone(),
                destroyed_opponent_ships: get_destroyed_ships(
                    &self.player1_ships,
                    &self.player2_shots,
                ),
                your_ships: self.player2_ships.clone(),
            };

            return Ok(player_game_state);
        }

        Err("Invalid player ID")
    }

    pub fn register_shot(&mut self, player_id: PlayerId, cell: u8) -> Result<(), &'static str> {
        if self.player1_id == player_id {
            self.player1_shots.push(cell);
            return Ok(());
        }

        if self.player2_id == player_id {
            self.player2_shots.push(cell);
            return Ok(());
        }

        Err("Invalid player ID")
    }
}

#[derive(Serialize, Debug)]
pub struct PlayerGameState {
    pub opponent_id: PlayerId,
    pub current_state: String,
    pub your_turn: bool,
    pub your_shots: Shots,
    pub opponent_shots: Shots,
    pub destroyed_opponent_ships: Vec<String>,
    pub your_ships: ShipPlacement,
}

fn get_destroyed_ships(ship_placement: &ShipPlacement, shots: &Shots) -> Vec<String> {
    let mut destroyed_ships = Vec::new();

    for (ship, placement) in ship_placement.iter() {
        let is_destroyed = placement.iter().map(|cell| shots.contains(cell)).all(|b| b);

        if is_destroyed {
            destroyed_ships.push(ship.clone());
        }
    }

    destroyed_ships
}
