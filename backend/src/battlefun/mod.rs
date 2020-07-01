use std::collections::HashMap;
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

trait ToBattleFunProto<P> {
    fn to_proto(&self) -> P;
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
