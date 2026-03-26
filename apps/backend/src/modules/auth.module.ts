import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@infrastructure/database/entities/user.entity';
import { UserRepository } from '@infrastructure/repositories/user.repository';
import { RegisterUserUseCase } from '@application/use-cases/auth/register.use-case';
import { AuthResolver } from '@presentation/resolvers/auth.resolver';

import { RoleModule } from './role.module';
import { DocumentModule } from './document.module';
import { SubmissionModule } from './submission.module';
import { MailModule } from '@infrastructure/integrations/mail/mail.module';
import { MinioModule } from '@infrastructure/integrations/minio/minio.module';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { UnitOfWork } from '@infrastructure/unit-of-work';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    DatabaseModule,
    MinioModule,
    MailModule,
    RoleModule,
    DocumentModule,
    SubmissionModule,
  ],
  providers: [
    { provide: 'IUserRepository', useClass: UserRepository },

    {
      provide: 'IUnitOfWork',
      useClass: UnitOfWork,
    },

    RegisterUserUseCase,

    AuthResolver,
  ],
  exports: ['IUserRepository', 'IUnitOfWork', RegisterUserUseCase],
})
export class AuthModule {}
