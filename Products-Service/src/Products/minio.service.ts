import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import sharp from 'sharp';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Minio.Client;
  private readonly bucketName: string;
  private readonly publicUrl?: string;

  constructor() {
    const rawEndpoint = process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT || 'minio';
    let endPoint = rawEndpoint;
    let useSSL = process.env.S3_USE_SSL === 'true' || rawEndpoint.startsWith('https://');
    let port = parseInt(process.env.S3_PORT || process.env.MINIO_PORT || (useSSL ? '443' : '9000'), 10);

    if (rawEndpoint.startsWith('http://') || rawEndpoint.startsWith('https://')) {
      try {
        const url = new URL(rawEndpoint);
        endPoint = url.hostname;
        useSSL = url.protocol === 'https:';
        port = url.port ? parseInt(url.port, 10) : (useSSL ? 443 : 80);
      } catch (e) {
        endPoint = rawEndpoint;
      }
    }

    this.bucketName = process.env.S3_BUCKET_NAME || process.env.MINIO_BUCKET || 'products';
    this.publicUrl = process.env.S3_PUBLIC_URL || process.env.R2_PUBLIC_URL;

    const accessKey = process.env.S3_ACCESS_KEY || process.env.MINIO_ACCESS_KEY || 'minioadmin';
    const secretKey = process.env.S3_SECRET_KEY || process.env.MINIO_SECRET_KEY || 'minioadmin';
    const region = process.env.S3_REGION || 'auto';

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
      region,
    });
  }

  async onModuleInit() {
    let retries = 5;
    while (retries > 0) {
      try {
        const exists = await this.minioClient.bucketExists(this.bucketName);
        if (!exists) {
          await this.minioClient.makeBucket(this.bucketName, 'auto');
          console.log(`[StorageService] Bucket "${this.bucketName}" created successfully.`);
        } else {
          console.log(`[StorageService] Bucket "${this.bucketName}" is ready.`);
        }
        break;
      } catch (error) {
        retries--;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`[StorageService] Storage check warning (${retries} attempts left):`, errorMessage);
        if (retries === 0) {
          console.error('[StorageService] Could not verify bucket, proceeding with runtime operations.');
        } else {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    }
  }

  async uploadFile(file: any): Promise<string> {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const baseName = file.originalname
      ? file.originalname.substring(0, file.originalname.lastIndexOf('.')).replace(/[^a-zA-Z0-9.-]/g, '_')
      : 'image';
    const filename = `${uniqueSuffix}-${baseName}.webp`;

    const optimizedBuffer = await sharp(file.buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    await this.minioClient.putObject(
      this.bucketName,
      filename,
      optimizedBuffer,
      optimizedBuffer.length,
      { 'Content-Type': 'image/webp' },
    );

    if (this.publicUrl) {
      const cleanBase = this.publicUrl.replace(/\/+$/, '');
      return `${cleanBase}/${filename}`;
    }

    return `/uploads/${filename}`;
  }
}

