import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { buffer } from 'stream/consumers';

import { UserObjectType } from '@presentation/graphql/types/user.type';
import { RegisterInput } from '@presentation/graphql/inputs/register.input';
import { RegisterUserUseCase } from '@application/use-cases/auth/register.use-case';
import { DocumentType } from '@domain/enums/document.enum';

@Resolver(() => UserObjectType)
export class AuthResolver {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @Mutation(() => UserObjectType)
  async registerUser(
    @Args('input') input: RegisterInput,
    @Args('files', { type: () => [GraphQLUpload], nullable: true })
    files?: Promise<FileUpload>[],
    @Args('documentTypes', { type: () => [String], nullable: true })
    documentTypes?: DocumentType[],
  ): Promise<UserObjectType> {
    const resolvedFiles = files ?? [];

    const uploadedFiles = await Promise.all(
      resolvedFiles.map(async (filePromise, index) => {
        const resolved = await filePromise;
        const buf = await buffer(resolved.createReadStream());

        return {
          file: {
            buffer: buf,
            fileName: resolved.filename,
            mimeType: resolved.mimetype,
          },
          documentType: documentTypes?.[index] ?? DocumentType.OTHER,
        };
      }),
    );

    return this.registerUserUseCase.execute(
      input,
      uploadedFiles,
    ) as Promise<UserObjectType>;
  }
}
