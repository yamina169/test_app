import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { DocumentType as DocumentTypeEnum } from '@domain/enums/document.enum';

registerEnumType(DocumentTypeEnum, { name: 'DocumentType' });

@ObjectType('Document')
export class DocumentObjectType {
  @Field(() => ID)
  id!: string;

  @Field()
  fileName!: string;

  @Field()
  fileUrl!: string;

  @Field(() => DocumentTypeEnum)
  documentType!: DocumentTypeEnum;

  @Field(() => ID, { nullable: true })
  submissionId!: string | null;

  @Field()
  createdAt!: Date;
}
