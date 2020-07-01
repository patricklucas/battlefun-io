use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

use super::gamemaster::GameMaster;
use super::kafka::StatefunKafkaClient;
use super::matchmaking::Matchmaker;
use super::{Player, PlayerId, PlayerToken};

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
            "localhost:9092",
            "plucas.test.2",
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
}
