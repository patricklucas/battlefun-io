use std::collections::HashMap;
use tokio::sync::mpsc;
use uuid::Uuid;
use warp::ws::Message;

mod battlefun;
pub use battlefun::BattleFun;

pub mod gamemaster;
pub mod matchmaking;

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
