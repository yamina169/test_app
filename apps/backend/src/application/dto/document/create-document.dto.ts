import { IsEnum, IsNotEmpty } from 'class-validator';
import { DocumentType } from '@domain/enums/document.enum';

export class CreateDocumentDto {
  @IsNotEmpty()
  @IsEnum(DocumentType)
  documentType!: DocumentType;
}
