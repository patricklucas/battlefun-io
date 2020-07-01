use bytes::Bytes;
use prost::Message;
use serde::{Deserialize, Serialize};
use warp::{reject, reply::json, Reply};

use crate::{battlefun, error::Error, BattleFunInstance, Result};
use battlefun::{
    proto::from_game_fn, proto::FromGameFn, CellIndex, GameId, PlayerId, ShipPlacement,
};

#[derive(Deserialize, Debug)]
pub struct NewGameRequest {
    ships: ShipPlacement,
}

#[derive(Serialize, Debug)]
pub struct GenericResponse {
    success: bool,
}

impl GenericResponse {
    pub fn success() -> Self {
        Self { success: true }
    }
}

#[derive(Deserialize, Debug)]
pub struct TurnRequest {
    cell: CellIndex,
}

pub async fn new_game_handler(
    request: NewGameRequest,
    token: PlayerId,
    battlefun_instance: BattleFunInstance,
) -> Result<impl Reply> {
    let mut battlefun = battlefun_instance.write().await;

    let player_id = match battlefun.player_tokens.get(&token) {
        Some(id) => *id,
        None => return Err(reject::not_found()),
    };

    battlefun.matchmaker.play(player_id, request.ships).await;

    Ok(json(&GenericResponse::success()))
}

pub async fn turn_handler(
    game_id: GameId,
    request: TurnRequest,
    token: PlayerId,
    battlefun_instance: BattleFunInstance,
) -> Result<impl Reply> {
    let battlefun = battlefun_instance.write().await;

    let player_id = match battlefun.player_tokens.get(&token) {
        Some(id) => *id,
        None => return Err(reject::not_found()),
    };

    battlefun
        .gamemaster
        .write()
        .await
        .turn(game_id, player_id, request.cell)
        .await
        .map_err(reject::custom)?;

    Ok(json(&GenericResponse::success()))
}

pub async fn incoming_kafka_message_handler(
    body: Bytes,
    battlefun_instance: BattleFunInstance,
) -> Result<impl Reply> {
    let message = match FromGameFn::decode(body) {
        Ok(m) => m,
        Err(e) => return Err(reject::custom(Error::ProtobufDecodeError(e))),
    };

    let game_id = GameId::parse_str(&message.game_id).unwrap();
    let game_update = match message.response.unwrap() {
        from_game_fn::Response::GameUpdate(game_update) => game_update,
        from_game_fn::Response::Failure(failure) => {
            eprintln!("Got failure: {:?}", failure);
            return Err(reject::custom(Error::ErrorFromStatefun("uh-oh".to_owned())));
        }
    };

    let battlefun = battlefun_instance.write().await;
    battlefun.handle_game_update(
        game_id,
        PlayerId::parse_str(&game_update.player1_id).unwrap(),
        game_update.player1_placement.unwrap(),
        PlayerId::parse_str(&game_update.player2_id).unwrap(),
        game_update.player2_placement.unwrap(),
        game_update.status,
        game_update.player1_shots,
        game_update.player2_shots,
    );

    Ok(json(&GenericResponse::success()))
}
