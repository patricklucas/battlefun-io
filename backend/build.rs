fn main() {
    prost_build::compile_protos(&["../proto/test.proto"],
                                &["../proto/"]).unwrap();
}
