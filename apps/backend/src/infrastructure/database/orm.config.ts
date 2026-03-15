import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  isDev: boolean;
  isTest: boolean;
}

export const ormConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService): TypeOrmModuleOptions => {
    const db = config.get<DatabaseConfig>('database') as DatabaseConfig;

    return {
      type: 'postgres',
      host: db.host,
      port: db.port,
      username: db.username,
      password: db.password,
      database: db.database,
      autoLoadEntities: true,
      synchronize: db.isTest,
      dropSchema: db.isTest,
      migrationsRun: false,
      migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
      logging: db.isDev || db.isTest,
    };
  },
};
