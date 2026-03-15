import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubmissionEntity } from '@infrastructure/database/entities/submission.entity';
import { SubmissionRepository } from '@infrastructure/repositories/submission.repository';
import { CreateSubmissionUseCase } from '@application/use-cases/submission/create-submission.use-case';
import { SubmissionResolver } from '@presentation/resolvers/submission.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([SubmissionEntity])],
  providers: [
    { provide: 'ISubmissionRepository', useClass: SubmissionRepository },
    CreateSubmissionUseCase,
    SubmissionResolver,
  ],
  exports: ['ISubmissionRepository', CreateSubmissionUseCase],
})
export class SubmissionModule {}
