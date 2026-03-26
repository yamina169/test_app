import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ISubmissionRepository } from '@domain/interfaces/submission.repository.interface';
import { SubmissionEntity } from '../database/entities/submission.entity';
import { Submission } from '@domain/entities/submission.entity';
import { SubmissionMapper } from '../mappers/submission.mapper';
import { SubmissionType } from '@domain/enums/submission.enum';

@Injectable()
export class SubmissionRepository implements ISubmissionRepository {
  constructor(
    @InjectRepository(SubmissionEntity)
    private readonly repo: Repository<SubmissionEntity>,
  ) {}

  withRepo(repo: Repository<SubmissionEntity>): SubmissionRepository {
    return new SubmissionRepository(repo);
  }

  async findById(id: string): Promise<Submission | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!entity) return null;
    return SubmissionMapper.toDomain(entity);
  }

  async findByUserId(userId: string): Promise<Submission[]> {
    const entities = await this.repo.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    return entities.map((e) => SubmissionMapper.toDomain(e));
  }

  async findAll(): Promise<Submission[]> {
    const entities = await this.repo.find({ relations: ['user'] });
    return entities.map((e) => SubmissionMapper.toDomain(e));
  }

  async findByType(type: SubmissionType): Promise<Submission[]> {
    const entities = await this.repo.find({
      where: { submissionType: type },
      relations: ['user'],
    });
    return entities.map((e) => SubmissionMapper.toDomain(e));
  }

  async save(submission: Submission): Promise<Submission> {
    const entity = SubmissionMapper.toOrm(submission);
    const saved = await this.repo.save(entity);

    const withRelations = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });

    if (!withRelations)
      throw new Error(`Submission with id ${saved.id} not found`);

    return SubmissionMapper.toDomain(withRelations);
  }

  async delete(id: string): Promise<Submission | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    await this.repo.delete(id);
    return existing;
  }
}
