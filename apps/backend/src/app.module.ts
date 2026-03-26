import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { GraphQLUpload } from 'graphql-upload-ts';
import * as path from 'path';

import { MailModule } from '@infrastructure/integrations/mail/mail.module';
import { DatabaseModule } from '@infrastructure/database/database.module';
import appConfig from '@infrastructure/config/env/app.config';
import { dbConfig } from '@infrastructure/config/env/database.config';
import mailConfig from '@infrastructure/config/env/mail.config';
import { minioConfig } from '@infrastructure/config/env/minio.config';
import { envValidationSchema } from '@infrastructure/config/validation/env.validation';

import { AuthModule } from './modules/auth.module';
import { DocumentModule } from './modules/document.module';
import { SubmissionModule } from './modules/submission.module';
import { RoleModule } from './modules/role.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '../../../../.env'),
      load: [dbConfig, appConfig, mailConfig, minioConfig],
      validationSchema: envValidationSchema,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
      buildSchemaOptions: {
        scalarsMap: [{ type: () => GraphQLUpload, scalar: GraphQLUpload }],
      },
    }),
    DatabaseModule,
    MailModule,
    AuthModule,
    DocumentModule,
    SubmissionModule,
    RoleModule,
  ],
})
export class AppModule {}
