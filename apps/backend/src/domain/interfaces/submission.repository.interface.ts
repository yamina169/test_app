import { Submission } from '@domain/entities/submission.entity';
import { SubmissionType } from '@common/enums/submission.enum';

export interface ISubmissionRepository {
  findById(id: string): Promise<Submission | null>;
  findAll(): Promise<Submission[]>;
  findByUserId(userId: string): Promise<Submission[]>;
  findByType(type: SubmissionType): Promise<Submission[]>;
  save(submission: Submission): Promise<Submission>;
  delete(id: string): Promise<Submission | null>;
}
