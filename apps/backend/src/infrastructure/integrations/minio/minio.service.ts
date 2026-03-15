import {
  Injectable,
  OnModuleInit,
  Logger,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import * as Minio from 'minio';
import { createHash } from 'crypto';
import { IStorageService } from '@domain/interfaces/storage.service.interface';
import { minioConfig } from '../../config/env/minio.config';

/** Supported MIME types and their corresponding file extensions. */
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

@Injectable()
export class MinioService implements IStorageService, OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Minio.Client;

  constructor(
    @Inject(minioConfig.KEY)
    private readonly config: ConfigType<typeof minioConfig>,
  ) {
    this.client = new Minio.Client({
      endPoint: this.config.endPoint,
      port: this.config.port,
      useSSL: this.config.useSSL,
      accessKey: this.config.rootUser,
      secretKey: this.config.rootPassword,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      if (!(await this.client.bucketExists(this.config.bucket))) {
        await this.client.makeBucket(this.config.bucket);
        this.logger.log(`Bucket "${this.config.bucket}" created`);
      }

      // TODO: make bucket private
      await this.client.setBucketPolicy(
        this.config.bucket,
        JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.config.bucket}/*`],
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
  async ping(): Promise<boolean> {
    return this.client
      .bucketExists(this.config.bucket)
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Uploads a file to MinIO under the given submission folder.
   * Validates MIME type .
   * File is stored as submissionId/sha256hash.ext to avoid duplicates.
   */
  async uploadFile(
    file: Uint8Array,
    originalName: string,
    mimeType: string,
    submissionId: string,
  ): Promise<{ fileName: string; fileUrl: string }> {
    const allowedExt = ALLOWED_MIME_TYPES[mimeType];
    if (!allowedExt) {
      throw new BadRequestException(
        `Unsupported file type "${mimeType}". Allowed types: ${Object.keys(ALLOWED_MIME_TYPES).join(', ')}`,
      );
    }

    const incomingExt = originalName.split('.').pop()?.toLowerCase() ?? '';
    if (incomingExt !== allowedExt) {
      throw new BadRequestException(
        `File extension ".${incomingExt}" does not match declared MIME type "${mimeType}"`,
      );
    }

    const buffer = Buffer.from(file);
    const fileName = `${submissionId}/${createHash('sha256')
      .update(buffer)
      .digest('hex')}.${allowedExt}`;

    await this.client.putObject(
      this.config.bucket,
      fileName,
      buffer,
      buffer.length,
      { 'Content-Type': mimeType },
    );

    return { fileName, fileUrl: this.getFileUrl(fileName) };
  }

  private getFileUrl(fileName: string): string {
    return `${this.config.publicUrl}/${this.config.bucket}/${fileName}`;
  }

  async fileExists(ref: string): Promise<boolean> {
    return this.client
      .statObject(this.config.bucket, this.extractFileName(ref))
      .then(() => true)
      .catch(() => false);
  }

  async deleteFile(ref: string): Promise<void> {
    const fileName = this.extractFileName(ref);
    await this.client.removeObject(this.config.bucket, fileName);
    this.logger.log(`File "${fileName}" deleted`);
  }

  private extractFileName(ref: string): string {
    if (!ref || !ref.trim()) {
      throw new BadRequestException('File reference must not be empty');
    }

    const prefix = `${this.config.publicUrl.replace(/\/$/, '')}/${this.config.bucket}/`;
    return ref.startsWith(prefix) ? ref.slice(prefix.length) : ref;
  }
}
