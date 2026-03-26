import { registerAs } from '@nestjs/config';

export const dbConfig = registerAs('database', () => {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const isTest = nodeEnv === 'test';

  const port = Number(process.env.POSTGRES_PORT ?? 5432);

  return {
    host: process.env.POSTGRES_HOST,
    port,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: isTest ? process.env.POSTGRES_DB_TEST : process.env.POSTGRES_DB,
    isTest,
    isDev: nodeEnv === 'development',
  };
});
