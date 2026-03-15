import { Document } from '@domain/entities/document.entity';
import { DocumentType } from '@common/enums/document.enum';

export interface IDocumentRepository {
  findById(id: string): Promise<Document | null>;
  findAll(): Promise<Document[]>;
  findBySubmissionId(submissionId: string): Promise<Document[]>;
  findByType(documentType: DocumentType): Promise<Document[]>;
  save(document: Document): Promise<Document>;
  delete(id: string): Promise<Document | null>;
}
