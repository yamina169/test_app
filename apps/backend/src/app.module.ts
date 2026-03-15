import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLUpload } from 'graphql-upload-ts';

import { dbConfig } from '@infrastructure/config/env/database.config';
import { minioConfig } from '@infrastructure/config/env/minio.config';
import { ormConfig } from '@infrastructure/database/orm.config';
import { graphQlConfig } from '@infrastructure/config/env/graphql.config';
import { envValidationSchema } from '@infrastructure/config/validation/env.validation';
import { MinioModule } from '@infrastructure/integrations/minio/minio.module';
import { RoleModule } from './modules/role.module';
import { DocumentModule } from './modules/document.module';
import { SubmissionModule } from './modules/submission.module';
import { UserModule } from './modules/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      load: [dbConfig, minioConfig],
      envFilePath: '../../.env',
    }),

    TypeOrmModule.forRootAsync(ormConfig),

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...graphQlConfig,
        introspection: config.get<string>('NODE_ENV') !== 'production',
        buildSchemaOptions: {
          scalarsMap: [{ type: () => GraphQLUpload, scalar: GraphQLUpload }],
        },
      }),
    }),

    MinioModule,
    RoleModule,
    DocumentModule,
    SubmissionModule,
    UserModule,
  ],
})
export class AppModule {}
