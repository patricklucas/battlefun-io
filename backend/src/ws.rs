use crate::{ClientState, Player, PlayerId, PlayerToken};
use futures::{FutureExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::from_str;
use tokio::sync::mpsc;
use warp::ws::{Message, WebSocket};

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

pub async fn client_connection(ws: WebSocket, mut player: Player, client_state: ClientState) {
    let player_id = player.id;
    let (client_ws_sender, mut client_ws_rcv) = ws.split();
    let (client_sender, client_rcv) = mpsc::unbounded_channel();

    tokio::task::spawn(client_rcv.forward(client_ws_sender).map(|result| {
        if let Err(e) = result {
            eprintln!("error sending websocket msg: {}", e);
        }
    }));

    player.sender = Some(client_sender);
    client_state
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
        client_msg(&player_id, msg, &client_state).await;
    }

    player.sender = None;
    client_state
        .write()
        .await
        .players
        .insert(player_id, player.clone());
    println!("{} disconnected", player_id);
}

async fn client_msg(id: &PlayerId, msg: Message, client_state: &ClientState) {
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

    authenticate(id, auth_req.token, client_state).await;
}

async fn authenticate(id: &PlayerId, token: PlayerToken, client_state: &ClientState) {
    let mut state = client_state.write().await;

    match state.players.get_mut(id) {
        Some(p) => {
            if p.token == token {
                p.authenticated = true;

                if let Some(sender) = &p.sender {
                    let json = serde_json::to_string(&AuthenticationResponse::success()).unwrap();
                    let _ = sender.send(Ok(Message::text(json)));
                }
            } else {
                if let Some(sender) = &p.sender {
                    let json = serde_json::to_string(&AuthenticationResponse::failure()).unwrap();
                    let _ = sender.send(Ok(Message::text(json)));
                }
            }
        }
        None => return,
    };
}
