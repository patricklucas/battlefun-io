FROM rust:buster as build
WORKDIR /build

# Do a dummy build to download and compile dependencies
RUN set -e; \
  mkdir src; \
  echo "fn main() {println!(\"if you see this, the build broke\")}" > src/main.rs
COPY Cargo.toml Cargo.lock ./

# Clean up the dummy build artifacts
RUN set -e; \
  cargo build --release; \
  rm -f target/release/deps/battlefun_io-*

# Add the sources and do the real build
COPY . .
RUN cargo build --release
RUN cargo install --path .

FROM debian:buster-slim
COPY --from=build /usr/local/cargo/bin/battlefun_io /usr/local/bin/battlefun_io
CMD ["battlefun_io"]
