import { registerAs } from '@nestjs/config';

export const dbConfig = registerAs('database', () => {
  const env = process.env.NODE_ENV || 'development';
  const isTest = env === 'test';

  return {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT as string, 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: isTest ? process.env.POSTGRES_DB_TEST : process.env.POSTGRES_DB,
    isTest,
    isDev: env === 'development',
  };
});
