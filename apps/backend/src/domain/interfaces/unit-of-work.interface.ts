import { IUserRepository } from './user.repository.interface';
import { ISubmissionRepository } from './submission.repository.interface';
import { IDocumentRepository } from './document.repository.interface';

/** Coordinates multiple repository operations within a single atomic transaction. */
export interface IUnitOfWork {
  userRepository: IUserRepository;
  submissionRepository: ISubmissionRepository;
  documentRepository: IDocumentRepository;

  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
