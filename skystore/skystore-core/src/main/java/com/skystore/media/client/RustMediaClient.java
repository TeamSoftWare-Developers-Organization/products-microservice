package com.skystore.media.client;

import com.skystore.media.grpc.ImageProcessorGrpc;
import com.skystore.media.grpc.ImageRequest;
import com.skystore.media.grpc.ImageResponse;
import com.google.protobuf.ByteString;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

@Service
public class RustMediaClient {

    @GrpcClient("rust-media-service")
    private ImageProcessorGrpc.ImageProcessorBlockingStub blockingStub;

    public ImageResponse processImage(String imageId, byte[] rawBytes, int width, int height) {
        ImageRequest request = ImageRequest.newBuilder()
                .setImageId(imageId)
                .setRawBytes(ByteString.copyFrom(rawBytes))
                .setTargetWidth(width)
                .setTargetHeight(height)
                .build();

        return blockingStub.optimizeImage(request);
    }
}
