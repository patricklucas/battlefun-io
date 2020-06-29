FROM rust:buster as build
WORKDIR /build
COPY . .
RUN cargo install --path .

FROM debian:buster-slim
COPY --from=build /usr/local/cargo/bin/battlefun_io /usr/local/bin/battlefun_io
CMD ["battlefun_io"]
