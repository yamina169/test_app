import { Injectable, Scope } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { IUnitOfWork } from '@domain/interfaces/unit-of-work.interface';
import { IUserRepository } from '@domain/interfaces/user.repository.interface';
import { ISubmissionRepository } from '@domain/interfaces/submission.repository.interface';
import { IDocumentRepository } from '@domain/interfaces/document.repository.interface';
import { UserRepository } from '../repositories/user.repository';
import { SubmissionRepository } from '../repositories/submission.repository';
import { DocumentRepository } from '../repositories/document.repository';
import { UserEntity } from './entities/user.entity';
import { SubmissionEntity } from './entities/submission.entity';
import { DocumentEntity } from './entities/document.entity';

/**
 * Coordinates multiple repository operations within a single atomic transaction.
 * Scoped per request to ensure each request gets its own isolated transaction.
 */
@Injectable({ scope: Scope.REQUEST })
export class UnitOfWork implements IUnitOfWork {
  private manager: EntityManager;
  private queryRunner: QueryRunner | null = null;

  constructor(private readonly dataSource: DataSource) {
    this.manager = dataSource.manager;
  }

  /** Starts a transaction */
  async begin(): Promise<void> {
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
    this.manager = this.queryRunner.manager;
  }

  get userRepository(): IUserRepository {
    return new UserRepository(this.manager.getRepository(UserEntity));
  }

  get submissionRepository(): ISubmissionRepository {
    return new SubmissionRepository(
      this.manager.getRepository(SubmissionEntity),
    );
  }

  get documentRepository(): IDocumentRepository {
    return new DocumentRepository(this.manager.getRepository(DocumentEntity));
  }

  /** Persists all staged changes and releases the query runner. */
  async commit(): Promise<void> {
    if (!this.queryRunner) throw new Error('Transaction not started');
    await this.queryRunner.commitTransaction();
    await this.queryRunner.release();
    this.queryRunner = null;
    this.manager = this.dataSource.manager;
  }

  /** Reverts all staged changes*/
  async rollback(): Promise<void> {
    if (!this.queryRunner) return;
    await this.queryRunner.rollbackTransaction();
    await this.queryRunner.release();
    this.queryRunner = null;
    this.manager = this.dataSource.manager;
  }
}
