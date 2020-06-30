use std::collections::HashMap;
use std::convert::Infallible;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use uuid::Uuid;
use warp::{http::Method, ws::Message, Filter, Rejection};

mod error;
mod handler;
mod ws;

mod proto {
    include!(concat!(env!("OUT_DIR"), "/battlefun_io.proto.rs"));
}

type Result<T> = std::result::Result<T, Rejection>;

type ClientState = Arc<RwLock<ClientStateFoo>>;
type PlayerId = Uuid;
type PlayerToken = Uuid;

#[derive(Debug, Clone)]
pub struct Player {
    pub id: PlayerId,
    pub name: String,
    pub token: PlayerToken,
    pub sender: Option<mpsc::UnboundedSender<std::result::Result<Message, warp::Error>>>,
    pub authenticated: bool,
}

#[derive(Debug, Clone)]
pub struct ClientStateFoo {
    pub players: HashMap<PlayerId, Player>,
    pub player_tokens: HashMap<PlayerToken, PlayerId>,
}

impl ClientStateFoo {
    pub fn new() -> ClientStateFoo {
        ClientStateFoo {
            players: HashMap::new(),
            player_tokens: HashMap::new(),
        }
    }
}

#[tokio::main]
async fn main() {
    let client_state: ClientState = Arc::new(RwLock::new(ClientStateFoo::new()));

    let health_route = warp::path!("api" / "health").and_then(handler::health_handler);

    let register_route = warp::path!("api" / "register")
        .and(warp::post())
        .and(warp::body::json())
        .and(with_client_state(client_state.clone()))
        .and_then(handler::register_handler);

    let deregister_route = warp::path!("api" / "deregister")
        .and(warp::post())
        .and(warp::path::param())
        .and(with_client_state(client_state.clone()))
        .and_then(handler::deregister_handler);

    let publish = warp::path!("api" / "publish")
        .and(warp::body::json())
        .and(with_client_state(client_state.clone()))
        .and_then(handler::publish_handler);

    let ws_route = warp::path("ws")
        .and(warp::ws())
        .and(warp::path::param())
        .and(with_client_state(client_state.clone()))
        .and_then(handler::ws_handler);

    let cors = warp::cors()
        .allow_methods(&[Method::GET, Method::POST, Method::DELETE])
        .allow_headers(vec!["content-type"])
        .allow_any_origin();

    let routes = health_route
        .or(register_route)
        .or(deregister_route)
        .or(ws_route)
        .or(publish)
        .with(cors)
        .recover(error::handle_rejection);

    let (_, server) =
        warp::serve(routes).bind_with_graceful_shutdown(([0, 0, 0, 0], 8000), shutdown_signal());

    let _ = tokio::task::spawn(server).await;
}

async fn shutdown_signal() {
    tokio::signal::ctrl_c()
        .await
        .expect("Error setting Ctrl-C handler");

    eprintln!("Shutting down...");
}

fn with_client_state(
    client_state: ClientState,
) -> impl Filter<Extract = (ClientState,), Error = Infallible> + Clone {
    warp::any().map(move || client_state.clone())
}
