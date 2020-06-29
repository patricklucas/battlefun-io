use crate::{ws, ClientState, Player, PlayerId, PlayerToken, Result};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use warp::{http::StatusCode, reject, reply::json, ws::Message, Reply};

#[derive(Deserialize, Debug)]
pub struct RegisterRequest {
    name: Option<String>,
    token: Option<Uuid>,
}

#[derive(Serialize, Debug)]
pub struct RegisterResponse {
    player_id: Uuid,
    name: String,
    token: Uuid,
}

#[derive(Deserialize, Debug)]
pub struct TestMessage {
    message: String,
}

pub async fn publish_handler(body: TestMessage, client_state: ClientState) -> Result<impl Reply> {
    client_state
        .read()
        .await
        .players
        .iter()
        .filter(|(_, player)| player.authenticated)
        .for_each(|(_, player)| {
            if let Some(sender) = &player.sender {
                let _ = sender.send(Ok(Message::text(body.message.clone())));
            }
        });

    Ok(StatusCode::OK)
}

pub async fn register_handler(
    body: RegisterRequest,
    client_state: ClientState,
) -> Result<impl Reply> {
    let player = register_client(body, client_state).await?;
    Ok(json(&RegisterResponse {
        player_id: player.id,
        name: player.name,
        token: player.token,
    }))
}

async fn register_client(request: RegisterRequest, client_state: ClientState) -> Result<Player> {
    let mut state = client_state.write().await;

    let player_id: PlayerId = match request.token {
        Some(t) => match state.player_tokens.get(&t) {
            Some(id) => *id,
            None => return Err(reject::not_found()),
        },
        None => PlayerId::new_v4(),
    };

    let player_token: PlayerToken = match request.token {
        Some(t) => t,
        None => PlayerToken::new_v4(),
    };

    let name = match request.name {
        Some(n) => n,
        None => generate_name(player_id),
    };

    let player = Player {
        id: player_id,
        name: name,
        token: player_token,
        sender: None,
        authenticated: false,
    };

    let player_to_return = player.clone();

    state.players.insert(player_id, player);
    state.player_tokens.insert(player_token, player_id);

    Ok(player_to_return)
}

pub async fn deregister_handler(
    player_id: PlayerId,
    client_state: ClientState,
) -> Result<impl Reply> {
    let mut state = client_state.write().await;

    let player_token = state.players.get(&player_id).unwrap().token.clone();
    state.players.remove(&player_id);
    state.player_tokens.remove(&player_token);

    Ok(StatusCode::OK)
}

pub async fn ws_handler(
    ws: warp::ws::Ws,
    player_id: PlayerId,
    client_state: ClientState,
) -> Result<impl Reply> {
    let player = client_state.read().await.players.get(&player_id).cloned();
    match player {
        Some(p) => Ok(ws.on_upgrade(move |socket| ws::client_connection(socket, p, client_state))),
        None => Err(warp::reject::not_found()),
    }
}

pub async fn health_handler() -> Result<impl Reply> {
    Ok(StatusCode::OK)
}

pub fn generate_name(player_id: PlayerId) -> String {
    let (_, unique_num, _, _) = player_id.as_fields();
    format!("Anonymous_coward#{}", unique_num)
}
