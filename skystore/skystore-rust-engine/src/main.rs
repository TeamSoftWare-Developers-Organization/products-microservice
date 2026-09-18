use tonic::{transport::Server, Request, Response, Status};
use image::ImageReader;
use image::imageops::FilterType;
use std::io::Cursor;

pub mod media {
    tonic::include_proto!("skystore.media");
}
use media::image_processor_server::{ImageProcessor, ImageProcessorServer};
use media::{ImageRequest, ImageResponse};

#[derive(Default)]
pub struct MediaService;

#[tonic::async_trait]
impl ImageProcessor for MediaService {
    async fn optimize_image(&self, request: Request<ImageRequest>) -> Result<Response<ImageResponse>, Status> {
        let req = request.into_inner();
        let orig_size = req.raw_bytes.len() as i64;

        // فك تشفير وضغط الصورة في الذاكرة عبر Rust بدون Garbage Collector
        let img = ImageReader::new(Cursor::new(&req.raw_bytes))
            .with_guessed_format()
            .map_err(|e| Status::invalid_argument(e.to_string()))?
            .decode()
            .map_err(|e| Status::internal(e.to_string()))?;

        let target_w = if req.target_width > 0 { req.target_width as u32 } else { img.width() };
        let target_h = if req.target_height > 0 { req.target_height as u32 } else { img.height() };

        let resized = img.resize(target_w, target_h, FilterType::Lanczos3);
        let mut out_buffer = Cursor::new(Vec::new());
        resized.write_to(&mut out_buffer, image::ImageFormat::WebP)
            .map_err(|e| Status::internal(e.to_string()))?;

        let optimized_bytes = out_buffer.into_inner();
        let opt_size = optimized_bytes.len() as i64;

        Ok(Response::new(ImageResponse {
            image_id: req.image_id,
            optimized_bytes,
            format: "webp".to_string(),
            original_size: orig_size,
            optimized_size: opt_size,
        }))
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr = "0.0.0.0:50051".parse()?;
    println!("🚀 Rust Media gRPC Server running on port 50051...");
    Server::builder()
        .add_service(ImageProcessorServer::new(MediaService::default()))
        .serve(addr)
        .await?;
    Ok(())
}
