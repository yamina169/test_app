import { registerAs } from '@nestjs/config';

export const minioConfig = registerAs('minio', () => ({
  endPoint: process.env.MINIO_HOST as string,
  port: parseInt(process.env.MINIO_PORT as string, 10),
  rootUser: process.env.MINIO_ROOT_USER as string,
  rootPassword: process.env.MINIO_ROOT_PASSWORD as string,
  bucket: process.env.MINIO_BUCKET as string,
  publicUrl: process.env.MINIO_PUBLIC_URL as string,
  useSSL: process.env.MINIO_USE_SSL === 'true',
}));
