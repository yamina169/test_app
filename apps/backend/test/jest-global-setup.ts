import 'tsconfig-paths/register';
import { config } from 'dotenv';
import { join } from 'path';
import { Client } from 'pg';
import type { DataSource } from 'typeorm';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

process.env.NODE_ENV = 'test';
config({ path: join(__dirname, '../../../.env') });

/**
 * Jest global setup — runs once before all test suites.
 * Creates the test database if it does not exist, then initializes
 * AppDataSource to trigger synchronize: true, which creates all tables.
 */
export default async function (): Promise<void> {
  const { AppDataSource } = (await import(
    join(__dirname, '../src/infrastructure/database/data-source')
  )) as { AppDataSource: DataSource };

  const opts = AppDataSource.options as PostgresConnectionOptions;
  const dbName = opts.database as string;
  const rawPassword =
    typeof opts.password === 'function' ? opts.password() : opts.password;
  const password = String(await Promise.resolve(rawPassword));

  const client = new Client({
    host: opts.host,
    port: opts.port,
    user: opts.username as string,
    password,
    database: 'postgres',
  });

  await client.connect();

  const { rowCount } = await client.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [dbName],
  );

  if (rowCount === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
  }

  await client.end();
  await AppDataSource.initialize();
  await AppDataSource.destroy();
}
