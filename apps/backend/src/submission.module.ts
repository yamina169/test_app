import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Submission } from '@domain/entities/submission.entity';
import { SubmissionRepository } from '@infrastructure/repositories/submission.repository';
import { UserRepository } from '@infrastructure/repositories/user.repository';
import { User } from '@domain/entities/user.entity';
import { CreateSubmissionUseCase } from '@application/use-cases/submission/create-submission.use-case';
import { SubmissionResolver } from '@presentation/resolvers/submission.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Submission, User])],
  providers: [
    { provide: 'ISubmissionRepository', useClass: SubmissionRepository },
    { provide: 'IUserRepository', useClass: UserRepository },
    CreateSubmissionUseCase,
    SubmissionResolver,
  ],
  exports: ['ISubmissionRepository', CreateSubmissionUseCase],
})
export class SubmissionModule {}
