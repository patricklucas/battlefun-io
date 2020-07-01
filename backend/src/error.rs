use crate::battlefun::GameId;
use serde::Serialize;
use std::convert::Infallible;
use thiserror::Error;
use warp::{http::StatusCode, Rejection, Reply};

#[derive(Error, Debug)]
pub enum Error {
    #[error("unknown game: {0}")]
    NoSuchGame(GameId),

    #[error("invalid argument: {0}")]
    InvalidArgument(String),

    #[error("protobuf serialization error: {0}")]
    ProtobufError(#[from] prost::EncodeError),

    #[error("kafka communication error: {0}")]
    KafkaError(#[from] rdkafka::error::KafkaError),

    #[error("unknown error")]
    #[allow(dead_code)]
    Other,
}

impl warp::reject::Reject for Error {}

#[derive(Serialize)]
struct ErrorResponse {
    message: String,
}

pub async fn handle_rejection(err: Rejection) -> std::result::Result<impl Reply, Infallible> {
    let code;
    let message: String;

    if err.is_not_found() {
        code = StatusCode::NOT_FOUND;
        message = "Not Found".to_owned();
    } else if let Some(_) = err.find::<warp::filters::body::BodyDeserializeError>() {
        code = StatusCode::BAD_REQUEST;
        message = "Invalid Body".to_owned();
    } else if let Some(e) = err.find::<Error>() {
        match e {
            Error::NoSuchGame(_) => {
                code = StatusCode::NOT_FOUND;
                message = format!("{}", e);
            }
            Error::InvalidArgument(_) => {
                code = StatusCode::BAD_REQUEST;
                message = format!("{}", e);
            }
            _ => {
                eprintln!("unhandled application error: {:?}", err);
                code = StatusCode::INTERNAL_SERVER_ERROR;
                message = "Internal Server Error".to_owned();
            }
        }
    } else if let Some(_) = err.find::<warp::reject::MethodNotAllowed>() {
        code = StatusCode::METHOD_NOT_ALLOWED;
        message = "Method Not Allowed".to_owned();
    } else {
        eprintln!("unhandled error: {:?}", err);
        code = StatusCode::INTERNAL_SERVER_ERROR;
        message = "Internal Server Error".to_owned();
    }

    let json = warp::reply::json(&ErrorResponse { message });

    Ok(warp::reply::with_status(json, code))
}
