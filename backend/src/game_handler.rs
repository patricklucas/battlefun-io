use crate::{battlefun, BattleFunInstance, Result};
use serde::{Deserialize, Serialize};
use warp::{reject, reply::json, Reply};

use battlefun::{CellIndex, GameId, PlayerId, ShipPlacement};

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
        .map_err(reject::custom)?;

    Ok(json(&GenericResponse::success()))
}
