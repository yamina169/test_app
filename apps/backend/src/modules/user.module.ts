import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@infrastructure/database/entities/user.entity';
import { UserRepository } from '@infrastructure/repositories/user.repository';
import { UnitOfWork } from '@infrastructure/database/unit-of-work';
import { RegisterUserUseCase } from '@application/use-cases/auth/register.use-case';
import { UserResolver } from '@presentation/resolvers/user.resolver';
import { SubmissionModule } from './submission.module';
import { DocumentModule } from './document.module';
import { RoleModule } from './role.module';
import { MinioModule } from '@infrastructure/integrations/minio/minio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    SubmissionModule,
    DocumentModule,
    RoleModule,
    MinioModule,
  ],
  providers: [
    { provide: 'IUserRepository', useClass: UserRepository },
    { provide: 'IUnitOfWork', useClass: UnitOfWork },
    RegisterUserUseCase,
    UserResolver,
  ],
  exports: ['IUserRepository', RegisterUserUseCase],
})
export class UserModule {}
