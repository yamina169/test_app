import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('POSTGRES_HOST'),
        port: config.get<number>('POSTGRES_PORT'),
        username: config.get<string>('POSTGRES_USER'),
        password: config.get<string>('POSTGRES_PASSWORD'),
        database:
          config.get('NODE_ENV') === 'test'
            ? config.get<string>('POSTGRES_DB_TEST')
            : config.get<string>('POSTGRES_DB'),
        entities: [join(__dirname, '../../**/*.entity{.ts,.js}')],
        synchronize: false,
        migrationsRun: false,
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
