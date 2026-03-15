import { IsEnum, IsNotEmpty } from 'class-validator';
import { DocumentType } from '@common/enums/document.enum';

export class CreateDocumentDto {
  @IsNotEmpty()
  @IsEnum(DocumentType)
  documentType: DocumentType;
}
