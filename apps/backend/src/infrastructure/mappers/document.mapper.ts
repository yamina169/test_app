import { Document } from '@domain/entities/document.entity';
import { DocumentEntity } from '../database/entities/document.entity';
import { SubmissionEntity } from '../database/entities/submission.entity';

export class DocumentMapper {
  static toDomain(entity: DocumentEntity): Document {
    return new Document(
      entity.id,
      entity.fileName,
      entity.fileUrl,
      entity.documentType,
      entity.submission ? entity.submission.id : null,
      entity.createdAt,
    );
  }

  static toOrm(domain: Document): DocumentEntity {
    const entity = new DocumentEntity();

    entity.id = domain.id;
    entity.fileName = domain.fileName;
    entity.fileUrl = domain.fileUrl;
    entity.documentType = domain.documentType;
    entity.createdAt = domain.createdAt;

    entity.submission = domain.submissionId
      ? ({ id: domain.submissionId } as SubmissionEntity)
      : null;

    return entity;
  }
}
