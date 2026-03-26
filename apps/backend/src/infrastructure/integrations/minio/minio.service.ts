import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Readable } from 'stream';
import * as Minio from 'minio';
import { createHash } from 'crypto';

import type { IStorageService } from '@domain/interfaces/storage.service.interface';
import type { UploadedFile } from '@domain/interfaces/uploaded-file.interface';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '@domain/constants/storage.constants';
import { minioConfig } from '../../config/env/minio.config';
// Bucket will be secured as private in an upcoming update
function buildPublicReadPolicy(bucket: string): string {
  return JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  });
}

@Injectable()
export class MinioService implements IStorageService, OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Minio.Client;
  private readonly bucket: string;

  constructor(
    @Inject(minioConfig.KEY)
    private readonly config: ConfigType<typeof minioConfig>,
  ) {
    this.bucket = config.bucket;
    this.client = new Minio.Client({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.rootUser,
      secretKey: config.rootPassword,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureBucket();
      await this.ensurePublicReadPolicy();
      this.logger.log('MinIO ready');
    } catch (error) {
      this.logger.error('MinIO init failed', error);
      throw new Error('MinIO is not reachable — cannot start app');
    }
  }

  private async ensureBucket(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
      this.logger.log(`Bucket "${this.bucket}" created`);
    }
  }

  private async ensurePublicReadPolicy(): Promise<void> {
    await this.client.setBucketPolicy(
      this.bucket,
      buildPublicReadPolicy(this.bucket),
    );
  }

  async uploadFile(
    file: UploadedFile,
    submissionId: string,
  ): Promise<{ fileName: string; fileUrl: string }> {
    const { buffer, fileName: originalName, mimeType } = file;

    if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `File exceeds maximum allowed size of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
      );
    }

    const allowedExt = ALLOWED_MIME_TYPES[mimeType];
    if (!allowedExt) {
      throw new Error(
        `Unsupported MIME type "${mimeType}". Allowed: ${Object.keys(ALLOWED_MIME_TYPES).join(', ')}`,
      );
    }

    const incomingExt = originalName.split('.').pop()?.toLowerCase() ?? '';
    if (incomingExt !== allowedExt) {
      throw new Error(
        `Extension ".${incomingExt}" does not match declared MIME type "${mimeType}"`,
      );
    }
    /**
     * Object key is content-addressed: submissionId/sha256.ext
     * Prevents duplicate storage for identical files within the same submission.
     */

    const sha256 = createHash('sha256').update(buffer).digest('hex');
    const objectKey = `${submissionId}/${sha256}.${allowedExt}`;

    await this.client.putObject(
      this.bucket,
      objectKey,
      Readable.from(buffer),
      buffer.byteLength,
      { 'Content-Type': mimeType },
    );

    return { fileName: objectKey, fileUrl: this.buildFileUrl(objectKey) };
  }

  async fileExists(ref: string): Promise<boolean> {
    return this.client
      .statObject(this.bucket, this.resolveObjectKey(ref))
      .then(() => true)
      .catch(() => false);
  }

  async deleteFile(ref: string): Promise<void> {
    const objectKey = this.resolveObjectKey(ref);
    await this.client.removeObject(this.bucket, objectKey);
    this.logger.log(`File "${objectKey}" deleted`);
  }

  async ping(): Promise<boolean> {
    return this.client
      .bucketExists(this.bucket)
      .then(() => true)
      .catch(() => false);
  }

  private buildFileUrl(objectKey: string): string {
    return `${this.config.publicUrl}/${this.bucket}/${objectKey}`;
  }

  private resolveObjectKey(ref: string): string {
    if (!ref?.trim()) {
      throw new Error('File reference must not be empty');
    }
    const prefix = `${this.config.publicUrl.replace(/\/$/, '')}/${this.bucket}/`;
    return ref.startsWith(prefix) ? ref.slice(prefix.length) : ref;
  }
}
