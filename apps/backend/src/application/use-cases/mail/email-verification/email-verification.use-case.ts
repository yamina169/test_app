import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { SendVerificationEmailDto } from '@application/dto/mail/send-verification-email.dto';
import { MailTemplateKey } from '@domain/enums/mail/mail-template-key.enum';
import { SystemEmailSender } from '@domain/enums/mail/system-email-sender.enum';
import { type MailerPort, MAILER_PORT } from '@domain/interfaces/mailer.port';
import {
  type TokenPort,
  TOKEN_PORT,
  TokenPayload,
} from '@domain/interfaces/token.port';
import { emailBranding } from '@domain/constants/email-branding';

@Injectable()
export class EmailVerificationUseCase {
  constructor(
    @Inject(MAILER_PORT) private readonly mailer: MailerPort,
    @Inject(TOKEN_PORT) private readonly tokenPort: TokenPort,
    @Inject('FRONTEND_URL') private readonly frontendUrl: string,
  ) {}

  async sendVerificationEmail(dto: SendVerificationEmailDto): Promise<void> {
    const token = this.tokenPort.sign({
      sub: dto.email,
      email: dto.email,
    });

    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;

    const branding = emailBranding[dto.locale];

    await this.mailer.sendTemplatedEmail({
      to: dto.email,
      locale: dto.locale,
      senderKey: SystemEmailSender.NO_REPLY,
      templateKey: MailTemplateKey.EMAIL_VERIFICATION,
      context: {
        verificationUrl,
        branding,
        year: new Date().getFullYear(),
      },
    });
  }

  validateToken(token: string, expectedEmail: string): void {
    let payload: TokenPayload;

    try {
      payload = this.tokenPort.verify(token);
    } catch {
      throw new UnauthorizedException(
        'Verification token is invalid or expired',
      );
    }

    if (payload.sub !== expectedEmail) {
      throw new UnauthorizedException(
        'Verification token does not match the provided email',
      );
    }
  }
}
