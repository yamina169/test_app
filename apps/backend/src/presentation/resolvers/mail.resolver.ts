import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';

import { SendContactFormSubmittedEmailUseCase } from '@application/use-cases/mail/contact-us/send-contact-form-submitted-email.use-case';
import { EmailVerificationUseCase } from '@application/use-cases/mail/email-verification/email-verification.use-case';

import { TestContactEmailInput } from '@presentation/graphql/inputs/mail/test-contact-email.input';
import { SendVerificationEmailInput } from '@presentation/graphql/inputs/mail/send-verification-email.input';
import { EmailTestResponse } from '@presentation/graphql/types/mail/email-test-response.type';

@Resolver()
export class MailResolver {
  private readonly logger = new Logger(MailResolver.name);

  constructor(
    private readonly sendContactFormSubmittedEmailUseCase: SendContactFormSubmittedEmailUseCase,
    private readonly emailVerificationUseCase: EmailVerificationUseCase,
  ) {}

  @Query(() => String)
  healthCheck(): string {
    return 'OK';
  }

  @Mutation(() => EmailTestResponse)
  async testContactEmail(
    @Args('input') input: TestContactEmailInput,
  ): Promise<EmailTestResponse> {
    await this.sendContactFormSubmittedEmailUseCase.execute({
      email: input.email,
      locale: input.locale,
      subject: input.subject,
      reference: input.reference,
    });

    this.logger.log(`Test contact email sent to ${input.email}`);

    return {
      success: true,
      message: 'Email sent successfully',
    };
  }

  @Mutation(() => Boolean)
  async sendVerificationEmail(
    @Args('input') input: SendVerificationEmailInput,
  ): Promise<boolean> {
    await this.emailVerificationUseCase.sendVerificationEmail({
      email: input.email,
      locale: input.locale,
    });

    this.logger.log(`Verification email sent`);

    return true;
  }
}
