import { registerAs } from '@nestjs/config';

const env = (key: string) => process.env[key];
const requireEnv = (key: string) => {
  const v = env(key);
  if (!v) throw new Error(`Missing env var: "${key}"`);
  return v;
};

export const dbConfig = registerAs('database', () => {
  const isTest = (env('NODE_ENV') ?? 'development') === 'test';
  const port = parseInt(env('POSTGRES_PORT') ?? '5432', 10);

  return {
    host: requireEnv('POSTGRES_HOST'),
    port: Number.isNaN(port)
      ? (() => {
          throw new Error('Invalid POSTGRES_PORT');
        })()
      : port,
    username: requireEnv('POSTGRES_USER'),
    password: requireEnv('POSTGRES_PASSWORD'),
    database: requireEnv(isTest ? 'POSTGRES_DB_TEST' : 'POSTGRES_DB'),
    isTest,
    isDev: (env('NODE_ENV') ?? 'development') === 'development',
  };
});
