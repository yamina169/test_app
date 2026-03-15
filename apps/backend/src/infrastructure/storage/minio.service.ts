import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { createHash } from 'crypto';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Minio.Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(cfg: ConfigService) {
    this.client = new Minio.Client({
      endPoint: cfg.getOrThrow('MINIO_HOST'),
      port: parseInt(cfg.getOrThrow('MINIO_PORT'), 10),
      useSSL: false,
      accessKey: cfg.getOrThrow('MINIO_ROOT_USER'),
      secretKey: cfg.getOrThrow('MINIO_ROOT_PASSWORD'),
    });
    this.bucket = cfg.getOrThrow('MINIO_BUCKET');
    this.publicUrl = cfg.getOrThrow('MINIO_PUBLIC_URL');
  }

  /** Ensures the bucket exists and applies a public read policy  */
  async onModuleInit(): Promise<void> {
    try {
      if (!(await this.client.bucketExists(this.bucket))) {
        await this.client.makeBucket(this.bucket);
        this.logger.log(`Bucket "${this.bucket}" created`);
      }
      await this.client.setBucketPolicy(
        this.bucket,
        JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucket}/*`],
            },
          ],
        }),
      );
      this.logger.log('MinIO ready');
    } catch (error) {
      this.logger.error('MinIO init failed', error);
      throw new Error('MinIO is not reachable — cannot start app');
    }
  }

  /** Returns true if the bucket is reachable. */
  async ping(): Promise<boolean> {
    return this.client
      .bucketExists(this.bucket)
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Uploads a file to MinIO under a submission-scoped path.
   * The file name is derived from the SHA-256 hash of the buffer to ensure uniqueness.
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    submissionId: string,
  ): Promise<{ file_name: string; file_url: string }> {
    const file_name = `${submissionId}/${createHash('sha256').update(buffer).digest('hex')}.${originalName.split('.').pop()}`;
    await this.client.putObject(this.bucket, file_name, buffer, buffer.length, {
      'Content-Type': mimeType,
    });
    return { file_name, file_url: this.getFileUrl(file_name) };
  }

  /** Builds the public URL for a stored file. */
  getFileUrl(file_name: string): string {
    return `${this.publicUrl}/${this.bucket}/${file_name}`;
  }

  /** Accepts either a file name or a full file URL. */
  async fileExists(ref: string): Promise<boolean> {
    return this.client
      .statObject(this.bucket, this.extractFileName(ref))
      .then(() => true)
      .catch(() => false);
  }

  /** Deletes a file from MinIO. Accepts either a file name or a full file URL. */
  async deleteFile(ref: string): Promise<void> {
    const file_name = this.extractFileName(ref);
    await this.client.removeObject(this.bucket, file_name);
    this.logger.log(`File "${file_name}" deleted`);
  }

  /** Extracts the file name from a full URL, or returns the input unchanged if already a file name. */
  private extractFileName(file_url: string): string {
    const prefix = `${this.publicUrl}/${this.bucket}/`;
    return file_url.startsWith(prefix)
      ? file_url.slice(prefix.length)
      : file_url;
  }
}
