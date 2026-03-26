import { Injectable, Scope, Logger } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { IUnitOfWork } from '@domain/interfaces/unit-of-work.interface';
import { IUserRepository } from '@domain/interfaces/user.repository.interface';
import { ISubmissionRepository } from '@domain/interfaces/submission.repository.interface';
import { IDocumentRepository } from '@domain/interfaces/document.repository.interface';
import { UserRepository } from './repositories/user.repository';
import { SubmissionRepository } from './repositories/submission.repository';
import { DocumentRepository } from './repositories/document.repository';
import { UserEntity } from './database/entities/user.entity';
import { SubmissionEntity } from './database/entities/submission.entity';
import { DocumentEntity } from './database/entities/document.entity';

@Injectable({ scope: Scope.REQUEST })
export class UnitOfWork implements IUnitOfWork {
  private manager: EntityManager;
  private queryRunner: QueryRunner | null = null;
  private readonly logger = new Logger(UnitOfWork.name);

  constructor(private readonly dataSource: DataSource) {
    this.manager = dataSource.manager;
  }

  async begin(): Promise<void> {
    if (this.queryRunner) throw new Error('Transaction already started');

    this.queryRunner = this.dataSource.createQueryRunner();
    try {
      await this.queryRunner.connect();
      await this.queryRunner.startTransaction();
      this.manager = this.queryRunner.manager;
    } catch (err) {
      try {
        await this.queryRunner.release();
      } catch (releaseErr) {
        this.logger.error(
          'Failed to release queryRunner after begin error',
          releaseErr,
        );
      }
      this.queryRunner = null;
      this.manager = this.dataSource.manager;
      throw err;
    }
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

  async commit(): Promise<void> {
    if (!this.queryRunner) throw new Error('Transaction not started');

    try {
      await this.queryRunner.commitTransaction();
    } catch (err) {
      this.logger.error('Commit transaction failed', err);

      try {
        await this.queryRunner.rollbackTransaction();
      } catch (rollbackErr) {
        this.logger.error(
          'Rollback after failed commit also failed',
          rollbackErr,
        );
      }

      throw err;
    } finally {
      try {
        await this.queryRunner.release();
      } catch (releaseErr) {
        this.logger.error(
          'Failed to release queryRunner after commit',
          releaseErr,
        );
      } finally {
        this.queryRunner = null;
        this.manager = this.dataSource.manager;
      }
    }
  }

  async rollback(): Promise<void> {
    if (!this.queryRunner) return;

    try {
      await this.queryRunner.rollbackTransaction();
    } catch (err) {
      this.logger.error('Rollback transaction failed', err);
    } finally {
      try {
        await this.queryRunner.release();
      } catch (releaseErr) {
        this.logger.error(
          'Failed to release queryRunner after rollback',
          releaseErr,
        );
      } finally {
        this.queryRunner = null;
        this.manager = this.dataSource.manager;
      }
    }
  }
}
