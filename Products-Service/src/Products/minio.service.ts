import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import sharp from 'sharp';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;
  private readonly publicUrl?: string;
  private readonly publicRead: boolean;

  constructor() {
    const configuredEndpoint = process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT || 'minio';
    const looksLikePlaceholder = /your_|xxxxxxxx|example|cloudflare_account_id/i.test(configuredEndpoint);
    const rawEndpoint = looksLikePlaceholder ? 'minio' : configuredEndpoint;

    let endPoint = rawEndpoint;
    let useSSL = process.env.S3_USE_SSL === 'true' || rawEndpoint.startsWith('https://');
    let port = Number(process.env.S3_PORT || process.env.MINIO_PORT || (useSSL ? 443 : 9000));

    if (rawEndpoint.startsWith('http://') || rawEndpoint.startsWith('https://')) {
      const url = new URL(rawEndpoint);
      endPoint = url.hostname;
      useSSL = url.protocol === 'https:';
      port = url.port ? Number(url.port) : useSSL ? 443 : 80;
    }

    this.bucketName = process.env.S3_BUCKET_NAME || process.env.MINIO_BUCKET || 'products';
    const configuredPublicUrl = process.env.S3_PUBLIC_URL || process.env.R2_PUBLIC_URL;
    this.publicUrl = configuredPublicUrl && !/xxxxxxxx|example|your_/i.test(configuredPublicUrl)
      ? configuredPublicUrl.replace(/\/+$/, '')
      : undefined;
    this.publicRead = process.env.STORAGE_PUBLIC_READ !== 'false';

    const configuredAccessKey = process.env.S3_ACCESS_KEY || process.env.MINIO_ACCESS_KEY || 'minioadmin';
    const configuredSecretKey = process.env.S3_SECRET_KEY || process.env.MINIO_SECRET_KEY || 'minioadmin';
    const accessKey = /your_|example/i.test(configuredAccessKey) ? 'minioadmin' : configuredAccessKey;
    const secretKey = /your_|example/i.test(configuredSecretKey) ? 'minioadmin' : configuredSecretKey;

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
      region: process.env.S3_REGION || 'us-east-1',
    });

    console.log(`[StorageService] endpoint=${useSSL ? 'https' : 'http'}://${endPoint}:${port}, bucket=${this.bucketName}`);
  }

  async onModuleInit() {
    let retries = 8;
    while (retries > 0) {
      try {
        const exists = await this.minioClient.bucketExists(this.bucketName);
        if (!exists) {
          await this.minioClient.makeBucket(this.bucketName, process.env.S3_REGION || 'us-east-1');
        }

        if (this.publicRead) {
          const policy = {
            Version: '2012-10-17',
            Statement: [{
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            }],
          };
          await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        }

        console.log(`[StorageService] Bucket "${this.bucketName}" is ready.`);
        return;
      } catch (error) {
        retries--;
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[StorageService] Storage check warning (${retries} attempts left): ${message}`);
        if (retries === 0) {
          console.error('[StorageService] Storage unavailable at startup; product APIs will continue and uploads can be retried later.');
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    }
  }

  async uploadFile(file: any): Promise<string> {
    if (!file?.buffer) throw new Error('Invalid upload payload');

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const original = String(file.originalname || 'image');
    const stem = original.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'image';
    const filename = `${uniqueSuffix}-${stem}.webp`;

    const optimizedBuffer = await sharp(file.buffer)
      .rotate()
      .resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    await this.minioClient.putObject(
      this.bucketName,
      filename,
      optimizedBuffer,
      optimizedBuffer.length,
      {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    );

    if (this.publicUrl) return `${this.publicUrl}/${filename}`;
    return `/uploads/${filename}`;
  }
}
