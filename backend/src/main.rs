use std::convert::Infallible;
use std::sync::Arc;
use tokio::sync::RwLock;
use warp::{http::Method, Filter, Rejection};

mod error;
mod game_handler;
mod handler;
mod ws;

mod battlefun;
use battlefun::{BattleFun, GameId, PlayerToken};

type Result<T> = std::result::Result<T, Rejection>;
type BattleFunInstance = Arc<RwLock<BattleFun>>;

#[tokio::main]
async fn main() {
    let battlefun_instance: BattleFunInstance = Arc::new(RwLock::new(BattleFun::new()));

    let health_route = warp::path!("api" / "health").and_then(handler::health_handler);

    let register_route = warp::path!("api" / "register")
        .and(warp::post())
        .and(warp::body::json())
        .and(with_battlefun_instance(battlefun_instance.clone()))
        .and_then(handler::register_handler);

    let deregister_route = warp::path!("api" / "deregister")
        .and(warp::post())
        .and(warp::path::param())
        .and(with_battlefun_instance(battlefun_instance.clone()))
        .and_then(handler::deregister_handler);

    let new_game_route = warp::path!("api" / "game")
        .and(warp::post())
        .and(warp::body::json())
        .and(with_token())
        .and(with_battlefun_instance(battlefun_instance.clone()))
        .and_then(game_handler::new_game_handler);

    let turn_route = warp::path!("api" / "game" / GameId)
        .and(warp::post())
        .and(warp::body::json())
        .and(with_token())
        .and(with_battlefun_instance(battlefun_instance.clone()))
        .and_then(game_handler::turn_handler);

    let publish = warp::path!("api" / "publish")
        .and(warp::body::json())
        .and(with_battlefun_instance(battlefun_instance.clone()))
        .and_then(handler::publish_handler);

    let ws_route = warp::path("ws")
        .and(warp::ws())
        .and(warp::path::param())
        .and(with_battlefun_instance(battlefun_instance.clone()))
        .and_then(handler::ws_handler);

    let cors = warp::cors()
        .allow_methods(&[Method::GET, Method::POST, Method::DELETE])
        .allow_headers(vec!["content-type"])
        .allow_any_origin();

    let routes = health_route
        .or(register_route)
        .or(deregister_route)
        .or(new_game_route)
        .or(turn_route)
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

fn with_battlefun_instance(
    battlefun_instance: BattleFunInstance,
) -> impl Filter<Extract = (BattleFunInstance,), Error = Infallible> + Clone {
    warp::any().map(move || battlefun_instance.clone())
}

fn with_token() -> impl Filter<Extract = (PlayerToken,), Error = Rejection> + Copy {
    warp::header::<String>("authorization")
        .map(|value: String| -> String {
            let (_, rest) = value.split_at("Bearer ".len());
            rest.to_string()
        })
        .map(|token: String| -> PlayerToken { PlayerToken::parse_str(&token).unwrap() })
}
