use prost::Message;
use rdkafka::config::ClientConfig;
use rdkafka::producer::{DeliveryFuture, FutureProducer, FutureRecord};

use super::proto::{
    to_game_fn::{CreateGame, GetGameStatus, Msg, Turn},
    ToGameFn,
};
use super::{CellIndex, GameId, PlayerId, ShipPlacement, ToBattleFunProto};
use crate::error::Error;

pub struct StatefunKafkaClient {
    producer: FutureProducer,
    to_statefun_topic: String,
}

impl StatefunKafkaClient {
    pub fn new(brokers: &str, to_statefun_topic: String) -> Self {
        let producer: FutureProducer = ClientConfig::new()
            .set("bootstrap.servers", brokers)
            .create()
            .expect("Producer creation error");

        Self {
            producer,
            to_statefun_topic: to_statefun_topic.to_owned(),
        }
    }

    pub async fn send_create_game(
        &self,
        game_id: GameId,
        player1_id: PlayerId,
        player1_ships: ShipPlacement,
        player2_id: PlayerId,
        player2_ships: ShipPlacement,
    ) -> Result<DeliveryFuture, Error> {
        let create_game_msg = CreateGame {
            game_id: game_id.to_string(),
            player1_id: player1_id.to_string(),
            player2_id: player2_id.to_string(),
            player1_placement: Some(player1_ships.to_proto()),
            player2_placement: Some(player2_ships.to_proto()),
        };

        let message = ToGameFn {
            game_id: game_id.to_string(),
            msg: Some(Msg::CreateGame(create_game_msg)),
        };

        let mut buf = vec![];
        if let Err(error) = message.encode(&mut buf) {
            return Err(Error::ProtobufEncodeError(error.into()));
        }

        let key = game_id.to_string();
        let delivery_state = self.producer.send_result(
            FutureRecord::to(&self.to_statefun_topic)
                .payload(&buf)
                .key(&key),
        );
        match delivery_state {
            Ok(f) => Ok(f),
            Err((error, _)) => Err(Error::KafkaError(error.into())),
        }
    }

    pub async fn send_turn(
        &self,
        game_id: GameId,
        player_id: PlayerId,
        cell: CellIndex,
    ) -> Result<DeliveryFuture, Error> {
        let turn_msg = Turn {
            game_id: game_id.to_string(),
            player_id: player_id.to_string(),
            shot: cell as i64,
        };

        let message = ToGameFn {
            game_id: game_id.to_string(),
            msg: Some(Msg::Turn(turn_msg)),
        };

        let mut buf = vec![];
        if let Err(error) = message.encode(&mut buf) {
            return Err(Error::ProtobufEncodeError(error.into()));
        }

        let key = game_id.to_string();
        let delivery_state = self.producer.send_result(
            FutureRecord::to(&self.to_statefun_topic)
                .payload(&buf)
                .key(&key),
        );
        match delivery_state {
            Ok(f) => Ok(f),
            Err((error, _)) => Err(Error::KafkaError(error.into())),
        }
    }

    pub async fn send_get_game_status(&self, game_id: &GameId) -> Result<DeliveryFuture, Error> {
        let get_game_status_msg = GetGameStatus {
            game_id: game_id.to_string(),
        };

        let message = ToGameFn {
            game_id: game_id.to_string(),
            msg: Some(Msg::GetGameStatus(get_game_status_msg)),
        };

        let mut buf = vec![];
        if let Err(error) = message.encode(&mut buf) {
            return Err(Error::ProtobufEncodeError(error.into()));
        }

        let key = game_id.to_string();
        let delivery_state = self.producer.send_result(
            FutureRecord::to(&self.to_statefun_topic)
                .payload(&buf)
                .key(&key),
        );
        match delivery_state {
            Ok(f) => Ok(f),
            Err((error, _)) => Err(Error::KafkaError(error.into())),
        }
    }
}
