FROM rust:buster as build
WORKDIR /build
COPY . .
RUN cargo install --path .

FROM debian:buster-slim
COPY --from=build /usr/local/cargo/bin/battleship_gateway /usr/local/bin/battleship_gateway
CMD ["battleship_gateway"]
