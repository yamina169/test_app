// minio.config.ts
import { registerAs } from '@nestjs/config';

export const minioConfig = registerAs('minio', () => ({
  endPoint: process.env.MINIO_HOST!,
  port: parseInt(process.env.MINIO_PORT ?? '9000', 10),
  rootUser: process.env.MINIO_ROOT_USER!,
  rootPassword: process.env.MINIO_ROOT_PASSWORD!,
  bucket: process.env.MINIO_BUCKET!,
  publicUrl: process.env.MINIO_PUBLIC_URL!,
  useSSL: process.env.MINIO_USE_SSL === 'true',
}));
