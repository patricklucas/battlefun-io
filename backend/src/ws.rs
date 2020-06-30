use crate::{battlefun, BattleFunInstance};
use futures::{FutureExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::from_str;
use tokio::sync::mpsc;
use warp::ws::{Message, WebSocket};

use battlefun::{Player, PlayerId, PlayerToken};

#[derive(Deserialize, Debug)]
pub struct TopicsRequest {
    topics: Vec<String>,
}

#[derive(Deserialize, Debug)]
pub struct AuthenticationRequest {
    r#type: String,
    token: PlayerToken,
}

#[derive(Serialize, Debug)]
pub struct AuthenticationResponse {
    r#type: String,
    success: bool,
}

impl AuthenticationResponse {
    pub fn success() -> AuthenticationResponse {
        AuthenticationResponse {
            r#type: "authentication_response".to_string(),
            success: true,
        }
    }

    pub fn failure() -> AuthenticationResponse {
        AuthenticationResponse {
            r#type: "authentication_response".to_string(),
            success: false,
        }
    }
}

pub async fn client_connection(
    ws: WebSocket,
    mut player: Player,
    battlefun_instance: BattleFunInstance,
) {
    let player_id = player.id;
    let (client_ws_sender, mut client_ws_rcv) = ws.split();
    let (client_sender, client_rcv) = mpsc::unbounded_channel();

    tokio::task::spawn(client_rcv.forward(client_ws_sender).map(|result| {
        if let Err(e) = result {
            eprintln!("error sending websocket msg: {}", e);
        }
    }));

    // TODO: set connection, not fields
    player.connection.sender = Some(client_sender);
    player.connection.authenticated = false;

    battlefun_instance
        .write()
        .await
        .players
        .insert(player_id, player.clone());

    println!("{} connected", player_id);

    while let Some(result) = client_ws_rcv.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                eprintln!(
                    "error receiving ws message for id: {}): {}",
                    player_id.clone(),
                    e
                );
                break;
            }
        };
        client_msg(&player_id, msg, &battlefun_instance).await;
    }

    player.connection.sender = None;
    player.connection.authenticated = false;

    battlefun_instance
        .write()
        .await
        .players
        .insert(player_id, player.clone());

    println!("{} disconnected", player_id);
}

async fn client_msg(id: &PlayerId, msg: Message, battlefun_instance: &BattleFunInstance) {
    println!("received message from {}: {:?}", id, msg);

    let message = match msg.to_str() {
        Ok(v) => v,
        Err(_) => return,
    };

    if message == "ping" || message == "ping\n" {
        return;
    }

    let auth_req: AuthenticationRequest = match from_str(&message) {
        Ok(r) => r,
        Err(e) => {
            eprintln!("error while parsing authentication request: {}", e);
            return;
        }
    };

    authenticate(id, auth_req.token, battlefun_instance).await;
}

async fn authenticate(id: &PlayerId, token: PlayerToken, battlefun_instance: &BattleFunInstance) {
    let mut battlefun = battlefun_instance.write().await;

    match battlefun.players.get_mut(id) {
        Some(p) => {
            if p.token == token {
                p.connection.authenticated = true;

                if let Some(sender) = &p.connection.sender {
                    let json = serde_json::to_string(&AuthenticationResponse::success()).unwrap();
                    let _ = sender.send(Ok(Message::text(json)));
                }
            } else {
                if let Some(sender) = &p.connection.sender {
                    let json = serde_json::to_string(&AuthenticationResponse::failure()).unwrap();
                    let _ = sender.send(Ok(Message::text(json)));
                }
            }
        }
        None => return,
    };
}
