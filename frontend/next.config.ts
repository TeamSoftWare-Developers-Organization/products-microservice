import type { NextConfig } from "next";

const apiTarget = (process.env.INTERNAL_API_URL || "http://api-gateway-ms:8080").replace(/\/+$/, "");
const authTarget = (process.env.INTERNAL_AUTH_URL || "http://auth-ms:3001").replace(/\/+$/, "");
const productsTarget = (process.env.INTERNAL_PRODUCTS_URL || "http://products-ms:3002").replace(/\/+$/, "");
const minioTarget = (process.env.INTERNAL_MINIO_URL || "http://minio:9000").replace(/\/+$/, "");
const bucket = process.env.S3_BUCKET_NAME || process.env.MINIO_BUCKET || "products";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      // Auth administration lives in auth-ms and is intentionally bypassed from the generic gateway.
      { source: "/api/users", destination: `${authTarget}/api/users` },
      { source: "/api/users/:path*", destination: `${authTarget}/api/users/:path*` },
      // Multipart upload bypasses the generic gateway so the file stream is not reparsed/truncated.
      { source: "/api/products/upload", destination: `${productsTarget}/api/products/upload` },
      { source: "/api/:path*", destination: `${apiTarget}/api/:path*` },
      { source: "/uploads/:path*", destination: `${minioTarget}/${bucket}/:path*` },
    ];
  },
};

export default nextConfig;
