import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { DocumentType } from '@domain/enums/document.enum';

@InputType()
export class CreateDocumentInput {
  @IsNotEmpty()
  @IsEnum(DocumentType)
  @Field(() => DocumentType)
  documentType!: DocumentType;
}
