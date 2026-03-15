import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { Readable } from 'stream';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { UserObjectType } from '@presentation/graphql/types/user.type';
import { LoginType } from '@presentation/graphql/types/login.type';
import { RegisterInput } from '@presentation/graphql/inputs/auth/register.input';
import { LoginInput } from '@presentation/graphql/inputs/auth/login.input';
import { RegisterUserUseCase } from '@application/use-cases/auth/register.use-case';
import { LoginUseCase } from '@application/use-cases/auth/login.use-case';
import type { IUserRepository } from '@domain/interfaces/user.repository.interface';
import { USER_REPOSITORY } from '@domain/interfaces/user.repository.interface';
import { DocumentUploadInput } from '@application/interfaces/document-upload-input.interface';
import { DocumentType } from '@common/enums/document.enum';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { JwtPayload } from '@common/strategy/jwt.strategy';

async function streamToBuffer(this: void, stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream)
    chunks.push(Buffer.from(chunk as ArrayBufferLike));
  return Buffer.concat(chunks);
}

@Resolver(() => UserObjectType)
export class AuthResolver {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => UserObjectType)
  async me(@CurrentUser() user: JwtPayload): Promise<UserObjectType> {
    return this.userRepository.findById(
      user.sub,
    ) as unknown as Promise<UserObjectType>;
  }

  @Mutation(() => UserObjectType)
  async registerUser(
    @Args('input') input: RegisterInput,
    @Args('files', { type: () => [GraphQLUpload], nullable: true })
    files?: Promise<FileUpload & { document_type: DocumentType }>[],
  ): Promise<UserObjectType> {
    const documentUploadInputs: DocumentUploadInput[] = await Promise.all(
      (files ?? []).map(async (filePromise) => {
        const resolvedFile = await filePromise;
        const buffer = await streamToBuffer(resolvedFile.createReadStream());
        return {
          dto: {
            document_type: resolvedFile.document_type ?? DocumentType.OTHER,
          },
          file: {
            buffer,
            file_name: resolvedFile.filename,
            mimetype: resolvedFile.mimetype,
          },
        };
      }),
    );

    return this.registerUserUseCase.execute(
      input,
      documentUploadInputs,
    ) as unknown as UserObjectType;
  }

  @Mutation(() => LoginType)
  async login(@Args('input') input: LoginInput): Promise<LoginType> {
    return this.loginUseCase.execute(input) as unknown as LoginType;
  }
}
