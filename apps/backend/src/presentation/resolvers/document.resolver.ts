import { Resolver, Args, ID, Mutation } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

import { DocumentObjectType } from '@presentation/graphql/types/document.type';
import { CreateDocumentInput } from '@presentation/graphql/inputs/create-document.input';
import { CreateDocumentUseCase } from '@application/use-cases/document/create-document.use-case';
import { streamToBuffer } from '@common/utils/stream.utils';

/**
 * Handles document-related GraphQL mutations.
 * Delegates file processing and persistence to CreateDocumentUseCase.
 */
@Resolver(() => DocumentObjectType)
export class DocumentResolver {
  constructor(private readonly createDocumentUseCase: CreateDocumentUseCase) {}

  /** Uploads a file to storage and saves the document record. */
  @Mutation(() => DocumentObjectType)
  async uploadDocument(
    @Args('submissionId', { type: () => ID }) submissionId: string,
    @Args('input') input: CreateDocumentInput,
    @Args('file', { type: () => GraphQLUpload }) file: Promise<FileUpload>,
  ): Promise<DocumentObjectType> {
    const resolvedFile = await file;
    const buffer = await streamToBuffer(resolvedFile.createReadStream());

    return this.createDocumentUseCase.execute(
      {
        buffer,
        fileName: resolvedFile.filename,
        mimeType: resolvedFile.mimetype,
      },
      input.documentType,
      submissionId,
    ) as Promise<DocumentObjectType>;
  }
}
