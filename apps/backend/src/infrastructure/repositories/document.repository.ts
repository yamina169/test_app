import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { IDocumentRepository } from '@domain/interfaces/document.repository.interface';
import { DocumentEntity } from '../database/entities/document.entity';
import { Document } from '@domain/entities/document.entity';
import { DocumentMapper } from '../mappers/document.mapper';
import { DocumentType } from '@domain/enums/document.enum';

@Injectable()
export class DocumentRepository implements IDocumentRepository {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly repo: Repository<DocumentEntity>,
  ) {}

  // allows UnitOfWork to swap in a transactional manager without re-injecting the full repository
  withRepo(repo: Repository<DocumentEntity>): DocumentRepository {
    return new DocumentRepository(repo);
  }

  async findById(id: string): Promise<Document | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['submission'],
    });
    if (!entity) return null;
    return DocumentMapper.toDomain(entity);
  }

  async findAll(): Promise<Document[]> {
    const entities = await this.repo.find({ relations: ['submission'] });
    return entities.map((e) => DocumentMapper.toDomain(e));
  }

  async findBySubmissionId(submissionId: string): Promise<Document[]> {
    const entities = await this.repo.find({
      where: { submission: { id: submissionId } },
      relations: ['submission'],
    });
    return entities.map((e) => DocumentMapper.toDomain(e));
  }

  async findByType(documentType: DocumentType): Promise<Document[]> {
    const entities = await this.repo.find({
      where: { documentType },
      relations: ['submission'],
    });
    return entities.map((e) => DocumentMapper.toDomain(e));
  }

  async save(document: Document): Promise<Document> {
    const entity = DocumentMapper.toOrm(document);
    const saved = await this.repo.save(entity);

    const withRelations = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['submission'],
    });

    if (!withRelations)
      throw new Error(`Document with id ${saved.id} disappeared after save`);

    return DocumentMapper.toDomain(withRelations);
  }

  async delete(id: string): Promise<Document | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    await this.repo.delete(id);
    return existing;
  }
}
