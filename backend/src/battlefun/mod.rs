use std::collections::HashMap;

use serde::Serialize;
use tokio::sync::mpsc;
use uuid::Uuid;
use warp::ws::Message;

mod battlefun;
pub use battlefun::BattleFun;

pub mod gamemaster;
pub mod kafka;
pub mod matchmaking;

pub mod proto {
    include!(concat!(env!("OUT_DIR"), "/io.battlefun.rs"));
}

pub type GameId = Uuid;
pub type PlayerId = Uuid;
pub type PlayerToken = Uuid;
pub type ShipPlacement = HashMap<String, Vec<CellIndex>>;
pub type CellIndex = u8;

#[derive(Debug, Clone)]
pub struct Player {
    pub id: PlayerId,
    pub name: String,
    pub token: PlayerToken,
    pub connection: PlayerConnection,
}

#[derive(Debug, Clone)]
pub struct PlayerConnection {
    pub sender: Option<mpsc::UnboundedSender<std::result::Result<Message, warp::Error>>>,
    pub authenticated: bool,
}

#[derive(Serialize, Debug)]
pub struct Shot {
    pub cell: CellIndex,
    pub hit: bool,
}

#[derive(Serialize, Debug)]
pub struct PlayerGameState {
    pub game_id: GameId,
    pub opponent_id: PlayerId,
    pub current_state: i32,
    pub your_turn: bool,
    pub your_shots: Vec<Shot>,
    pub opponent_shots: Vec<Shot>,
    pub destroyed_opponent_ships: Vec<String>,
    pub your_ships: ShipPlacement,
}

trait ToBattleFunProto<P> {
    fn to_proto(&self) -> P;
}

trait FromBattleFunProto<T> {
    fn from_proto(&self) -> T;
}

impl ToBattleFunProto<proto::ShipPlacement> for ShipPlacement {
    fn to_proto(&self) -> proto::ShipPlacement {
        let ships = self
            .iter()
            .map(|(k, v)| proto::Ship {
                r#type: k.to_owned(),
                cells: v.iter().map(|&e| e as i64).collect(),
            })
            .collect();

        proto::ShipPlacement { ships }
    }
}

impl FromBattleFunProto<ShipPlacement> for proto::ShipPlacement {
    fn from_proto(&self) -> ShipPlacement {
        let mut ships = ShipPlacement::new();

        for ship in &self.ships {
            ships.insert(
                ship.r#type.clone(),
                ship.cells.iter().map(|&e| e as u8).collect(),
            );
        }

        ships
    }
}

impl FromBattleFunProto<Shot> for proto::Shot {
    fn from_proto(&self) -> Shot {
        Shot {
            cell: self.cell_id as u8,
            hit: self.shot,
        }
    }
}
