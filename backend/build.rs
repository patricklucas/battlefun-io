fn main() {
    prost_build::compile_protos(&["../proto/battlefunio.proto"], &["../proto/"]).unwrap();
}
