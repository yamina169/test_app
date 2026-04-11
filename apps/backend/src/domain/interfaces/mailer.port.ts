import { SupportedLocale } from '@domain/constants/supported-locales.constant';
import { MailTemplateKey } from '@domain/enums/mail/mail-template-key.enum';
import { SystemEmailSender } from '@domain/enums/mail/system-email-sender.enum';

/* 
   NestJS injection token for the MailerPort implementation. (DI)
   Helps maintain separation between the application and infrastructure layers.
*/
export const MAILER_PORT = 'MAILER_PORT';

export interface SendTemplatedEmailInput {
  to: string;
  locale: SupportedLocale;
  senderKey: SystemEmailSender;
  templateKey: MailTemplateKey;
  context: Record<string, unknown>;
}

// This is useful so that the application layer depends on this interface and not on Nodemailer directly
export interface MailerPort {
  sendTemplatedEmail: (input: SendTemplatedEmailInput) => Promise<void>;
}
