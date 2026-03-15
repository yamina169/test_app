import { DocumentType } from '@common/enums/document.enum';

export class Document {
  constructor(
    public readonly id: string,
    public readonly fileName: string,
    public readonly fileUrl: string,
    public readonly documentType: DocumentType,
    public readonly submissionId: string | null,
    public readonly createdAt: Date,
  ) {}
}
