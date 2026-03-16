import { Submission } from '@domain/entities/submission.entity';
import { SubmissionEntity } from '../database/entities/submission.entity';
import { UserEntity } from '../database/entities/user.entity';

export class SubmissionMapper {
  static toDomain(entity: SubmissionEntity): Submission {
    if (!entity.user) {
      throw new Error('SubmissionMapper: user must be loaded');
    }

    return new Submission(
      entity.id,
      entity.title,
      entity.description ?? null,
      entity.status,
      entity.submissionType,
      entity.user.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toOrm(domain: Submission): SubmissionEntity {
    const entity = new SubmissionEntity();

    entity.id = domain.id;
    entity.title = domain.title;
    entity.description = domain.description ?? undefined;
    entity.status = domain.status;
    entity.submissionType = domain.submissionType;
    entity.user = { id: domain.userId } as UserEntity;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;

    return entity;
  }
}
