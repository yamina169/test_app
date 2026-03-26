import { Resolver, Args, ID, Mutation } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { buffer } from 'stream/consumers';

import { DocumentObjectType } from '@presentation/graphql/types/document.type';
import { CreateDocumentInput } from '@presentation/graphql/inputs/create-document.input';
import { CreateDocumentUseCase } from '@application/use-cases/document/create-document.use-case';

@Resolver(() => DocumentObjectType)
export class DocumentResolver {
  constructor(private readonly createDocumentUseCase: CreateDocumentUseCase) {}

  @Mutation(() => DocumentObjectType)
  async uploadDocument(
    @Args('submissionId', { type: () => ID }) submissionId: string,
    @Args('input') input: CreateDocumentInput,
    @Args('file', { type: () => GraphQLUpload }) file: Promise<FileUpload>,
  ): Promise<DocumentObjectType> {
    const resolved = await file;
    const buf = await buffer(resolved.createReadStream());

    return this.createDocumentUseCase.execute(
      { buffer: buf, fileName: resolved.filename, mimeType: resolved.mimetype },
      input.documentType,
      submissionId,
    ) as Promise<DocumentObjectType>;
  }
}
