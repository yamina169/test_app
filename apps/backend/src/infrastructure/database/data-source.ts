import 'tsconfig-paths/register';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { dbConfig } from '../config/env/database.config';

config({ path: join(__dirname, '../../../../../.env') });

const { host, port, username, password, database, isTest, isDev } = dbConfig();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  entities: [join(__dirname, '../../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, './migrations/*{.ts,.js}')],
  synchronize: isTest,
  migrationsRun: false,
  logging: isDev || isTest,
});
