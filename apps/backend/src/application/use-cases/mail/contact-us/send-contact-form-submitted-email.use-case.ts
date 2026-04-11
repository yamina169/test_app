import { Inject, Injectable } from '@nestjs/common';
import { SendContactFormSubmittedEmailDto } from '@application/dto/mail/send-contact-form-submitted-email.dto';
import { MailTemplateKey } from '@domain/enums/mail/mail-template-key.enum';
import { SystemEmailSender } from '@domain/enums/mail/system-email-sender.enum';
import {
  type MailerPort,
  SendTemplatedEmailInput,
  MAILER_PORT,
} from '@domain/interfaces/mailer.port';
import { emailBranding } from '@domain/constants/email-branding';

@Injectable()
export class SendContactFormSubmittedEmailUseCase {
  constructor(
    @Inject(MAILER_PORT)
    private readonly mailer: MailerPort,
  ) {}

  async execute(input: SendContactFormSubmittedEmailDto): Promise<void> {
    const branding = emailBranding[input.locale];

    const payload: SendTemplatedEmailInput = {
      to: input.email,
      locale: input.locale,
      senderKey: SystemEmailSender.CONTACT,
      templateKey: MailTemplateKey.CONTACT_US_CONFIRMATION,
      context: {
        subject: input.subject,
        reference: input.reference,
        branding,
        year: new Date().getFullYear(),
      },
    };

    await this.mailer.sendTemplatedEmail(payload);
  }
}
