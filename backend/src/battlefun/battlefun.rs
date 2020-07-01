use std::collections::HashMap;
use std::sync::Arc;

use serde_json;
use tokio::sync::RwLock;
use warp::ws::Message;

use super::gamemaster::GameMaster;
use super::kafka::StatefunKafkaClient;
use super::matchmaking::Matchmaker;
use super::{
    proto::{GameStatus, ShipPlacement, Shot},
    FromBattleFunProto, GameId, Player, PlayerGameState, PlayerId, PlayerToken,
};

pub struct BattleFun {
    pub players: HashMap<PlayerId, Player>,
    pub player_tokens: HashMap<PlayerToken, PlayerId>,
    pub statefun_kafka_client: Arc<RwLock<StatefunKafkaClient>>,
    pub gamemaster: Arc<RwLock<GameMaster>>,
    pub matchmaker: Matchmaker,
}

impl BattleFun {
    pub fn new() -> Self {
        let statefun_kafka_client = Arc::new(RwLock::new(StatefunKafkaClient::new(
            "kafka-broker:9092",
            "to-statefun".to_owned(),
        )));
        let gamemaster = Arc::new(RwLock::new(GameMaster::new(statefun_kafka_client.clone())));

        Self {
            players: HashMap::new(),
            player_tokens: HashMap::new(),
            statefun_kafka_client: statefun_kafka_client.clone(),
            gamemaster: gamemaster.clone(),
            matchmaker: Matchmaker::new(gamemaster.clone()),
        }
    }

    pub fn handle_game_update(
        &self,
        game_id: GameId,
        player1_id: PlayerId,
        player1_placement: ShipPlacement,
        player2_id: PlayerId,
        player2_placement: ShipPlacement,
        status: i32,
        player1_shots: Vec<Shot>,
        player2_shots: Vec<Shot>,
    ) {
        let player1 = self.players.get(&player1_id).expect("unknown player1");
        let player2 = self.players.get(&player2_id).expect("unknown player2");

        let player1_state = PlayerGameState {
            game_id,
            opponent_id: player2_id,
            current_state: status,
            your_turn: status == 1,
            your_shots: player1_shots.iter().map(|s| s.from_proto()).collect(),
            opponent_shots: player2_shots.iter().map(|s| s.from_proto()).collect(),
            destroyed_opponent_ships: get_destroyed_ships(&player2_placement, &player1_shots),
            your_ships: player1_placement.from_proto(),
        };

        let player2_state = PlayerGameState {
            game_id,
            opponent_id: player1_id,
            current_state: status,
            your_turn: status == 2,
            your_shots: player2_shots.iter().map(|s| s.from_proto()).collect(),
            opponent_shots: player1_shots.iter().map(|s| s.from_proto()).collect(),
            destroyed_opponent_ships: get_destroyed_ships(&player1_placement, &player2_shots),
            your_ships: player2_placement.from_proto(),
        };

        if let Some(sender) = &player1.connection.sender {
            let json = serde_json::to_string(&player1_state).unwrap();
            let _ = sender.send(Ok(Message::text(json)));
        }

        if let Some(sender) = &player2.connection.sender {
            let json = serde_json::to_string(&player2_state).unwrap();
            let _ = sender.send(Ok(Message::text(json)));
        }
    }
}

fn get_destroyed_ships(ship_placement: &ShipPlacement, shots: &Vec<Shot>) -> Vec<String> {
    let shot_cells: Vec<i64> = shots.iter().map(|shot| shot.cell_id).collect();
    let mut destroyed_ships = Vec::new();

    for ship in &ship_placement.ships {
        let is_destroyed = ship
            .cells
            .iter()
            .map(|cell| shot_cells.contains(cell))
            .all(|b| b);

        if is_destroyed {
            destroyed_ships.push(ship.r#type.clone());
        }
    }

    destroyed_ships
}
