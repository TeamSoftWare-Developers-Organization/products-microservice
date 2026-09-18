FROM rust:alpine AS builder
RUN apk add --no-cache musl-dev protobuf-dev
WORKDIR /app
COPY Cargo.toml build.rs ./
COPY proto ./proto
COPY src ./src
RUN cargo build --release

FROM alpine:3.20
RUN apk add --no-cache libgcc
WORKDIR /app
COPY --from=builder /app/target/release/skystore-rust-engine /app/skystore-rust-engine
EXPOSE 50051
CMD ["/app/skystore-rust-engine"]
