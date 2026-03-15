import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { ISubmissionRepository } from '@domain/interfaces/submission.repository.interface';
import type { IUnitOfWork } from '@domain/interfaces/unit-of-work.interface';
import { CreateSubmissionDto } from '@application/dto/submission/create-submission.dto';
import { Submission } from '@domain/entities/submission.entity';
import { SubmissionStatus } from '@common/enums/submission.enum';

@Injectable()
export class CreateSubmissionUseCase {
  constructor(
    @Inject('ISubmissionRepository')
    private readonly submissionRepository: ISubmissionRepository,
  ) {}

  /**
   * @param submissionId - Pre-generated ID, useful when linking to documents in the same transaction.
   * @param uow          - When provided, executes within the caller's transaction.
   */
  async execute(
    dto: CreateSubmissionDto,
    userId: string,
    submissionId?: string,
    uow?: IUnitOfWork,
  ): Promise<Submission> {
    const repo = uow?.submissionRepository ?? this.submissionRepository;

    const submission = new Submission(
      submissionId ?? uuid(),
      dto.title,
      dto.description ?? null,
      SubmissionStatus.PENDING,
      dto.submissionType,
      userId,
      new Date(),
      new Date(),
    );

    return repo.save(submission);
  }
}
