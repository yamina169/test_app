import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { buffer } from 'stream/consumers';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '@presentation/decorators/current-user.decorator';
import { UserObjectType } from '@presentation/graphql/types/user.type';
import { LoginResponse } from '@presentation/graphql/types/login-response.type';
import { RegisterInput } from '@presentation/graphql/inputs/auth/register.input';
import { LoginWithEmailInput } from '@presentation/graphql/inputs/auth/login/login-with-email.input';
import { LoginWithHandicapCardInput } from '@presentation/graphql/inputs/auth/login/login-with-handicap-card.input';
import { ResetPasswordInput } from '@presentation/graphql/inputs/auth/reset-password.input';
import { SendEmailInput } from '@presentation/graphql/inputs/mail/send-email.input';

import { RegisterUserUseCase } from '@application/use-cases/auth/register/register.use-case';
import { LoginUseCase } from '@application/use-cases/auth/login/login.use-case';
import { ResetPasswordUseCase } from '@application/use-cases/auth/reset-password/reset-password.use-case';
import { EmailVerificationUseCase } from '@application/use-cases/mail/email-verification/email-verification.use-case';

import { type FileEntry } from '@domain/interfaces/uploaded-file.interface';
import { DocumentType } from '@domain/enums/document.enum';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly emailVerificationUseCase: EmailVerificationUseCase,
  ) {}

  @Mutation(() => Boolean)
  async sendVerificationEmail(
    @Args('input') input: SendEmailInput,
  ): Promise<boolean> {
    await this.emailVerificationUseCase.sendVerificationEmail(input);
    return true;
  }

  @Mutation(() => Boolean)
  async requestPasswordReset(
    @Args('input') input: SendEmailInput,
  ): Promise<boolean> {
    await this.resetPasswordUseCase.requestOtp(
      { email: input.email },
      input.locale,
    );
    return true;
  }

  @Mutation(() => UserObjectType)
  async register(
    @Args('input') input: RegisterInput,
    @Args('files', { type: () => [GraphQLUpload], nullable: true })
    files?: Promise<FileUpload>[],
    @Args('documentTypes', { type: () => [String], nullable: true })
    documentTypes?: DocumentType[],
  ): Promise<UserObjectType> {
    const uploadedFiles: FileEntry[] = await Promise.all(
      (files ?? []).map(async (filePromise, index): Promise<FileEntry> => {
        const file = await filePromise;
        return {
          file: {
            buffer: await buffer(file.createReadStream()),
            fileName: file.filename,
            mimeType: file.mimetype,
          },
          documentType: documentTypes?.[index] ?? DocumentType.OTHER,
        };
      }),
    );

    return this.registerUserUseCase.execute(input, uploadedFiles);
  }

  @Mutation(() => LoginResponse)
  async loginWithEmail(
    @Args('input') input: LoginWithEmailInput,
  ): Promise<LoginResponse> {
    const result = await this.loginUseCase.execute(input);

    if ('accessToken' in result && 'refreshToken' in result) {
      return {
        accessToken: result.accessToken,
        message: 'Login successful',
      };
    }

    throw new Error('Unexpected login result for email login');
  }

  @Mutation(() => String)
  async loginWithHandicapCard(
    @Args('input') input: LoginWithHandicapCardInput,
  ): Promise<string> {
    const result = await this.loginUseCase.execute(input);

    if ('magicLinkSent' in result) {
      return 'Magic link sent';
    }

    throw new Error('Unexpected login result for handicap card login');
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Args('input') input: ResetPasswordInput,
  ): Promise<boolean> {
    await this.resetPasswordUseCase.resetPassword(input);
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  logout(): boolean {
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserObjectType)
  me(@CurrentUser() user: UserObjectType): UserObjectType {
    return user;
  }
}
