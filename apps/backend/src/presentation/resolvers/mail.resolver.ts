import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';

import { SendContactFormSubmittedEmailUseCase } from '@application/use-cases/mail/contact-us/send-contact-form-submitted-email.use-case';
import { TestContactEmailInput } from '@presentation/graphql/inputs/mail/test-contact-email.input';

@Resolver()
export class MailResolver {
  private readonly logger = new Logger(MailResolver.name);

  constructor(
    private readonly sendContactFormSubmittedEmailUseCase: SendContactFormSubmittedEmailUseCase,
  ) {}

  @Mutation(() => Boolean)
  async testContactEmail(
    @Args('input') input: TestContactEmailInput,
  ): Promise<boolean> {
    await this.sendContactFormSubmittedEmailUseCase.execute({
      email: input.email,
      locale: input.locale,
      subject: input.subject,
      reference: input.reference,
    });

    this.logger.log(`Test contact email sent to ${input.email}`);
    return true;
  }
}
