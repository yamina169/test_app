import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

import { UserObjectType } from '@presentation/graphql/types/user.type';
import { RegisterInput } from '@presentation/graphql/inputs/register.input';
import { RegisterUserUseCase } from '@application/use-cases/auth/register.use-case';
import type { IUserRepository } from '@domain/interfaces/user.repository.interface';
import { DocumentType } from '@common/enums/document.enum';
import { streamToBuffer } from '@common/utils/stream.utils';

/** Handles user-related GraphQL mutations and queries */
@Resolver(() => UserObjectType)
export class UserResolver {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  @Query(() => [UserObjectType])
  async getUsers(): Promise<UserObjectType[]> {
    return this.userRepository.findAll() as Promise<UserObjectType[]>;
  }

  /** Registers a new user */
  @Mutation(() => UserObjectType)
  async registerUser(
    @Args('input') input: RegisterInput,
    @Args('files', { type: () => [GraphQLUpload], nullable: true })
    files?: Promise<FileUpload>[],
    @Args('documentTypes', { type: () => [String], nullable: true })
    documentTypes?: DocumentType[],
  ): Promise<UserObjectType> {
    const uploadedFiles = await Promise.all(
      (files ?? []).map(async (filePromise, index) => {
        const resolvedFile = await filePromise;
        const buffer = await streamToBuffer(resolvedFile.createReadStream());
        return {
          file: {
            buffer,
            fileName: resolvedFile.filename,
            mimeType: resolvedFile.mimetype,
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
