use crate::{battlefun, BattleFunInstance, Result};
use serde::{Deserialize, Serialize};
use warp::{reject, reply::json, Reply};

use battlefun::{PlayerId, ShipPlacement};

#[derive(Deserialize, Debug)]
pub struct NewGameRequest {
    ships: ShipPlacement,
}

#[derive(Serialize, Debug)]
pub struct NewGameResponse {
    success: bool,
}

impl NewGameResponse {
    pub fn success() -> Self {
        Self {
            success: true,
        }
    }
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

    Ok(json(&NewGameResponse::success()))
}
