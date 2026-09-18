fn main() -> Result<(), Box<dyn std::error::Error>> {
    let proto_path = if std::path::Path::new("proto/image_service.proto").exists() {
        "proto/image_service.proto"
    } else {
        "../skystore-common/src/main/proto/image_service.proto"
    };
    tonic_build::compile_protos(proto_path)?;
    Ok(())
}
