import {
  Inject,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { SendVerificationEmailDto } from '@application/dto/mail/send-verification-email.dto';
import { MailTemplateKey } from '@domain/enums/mail/mail-template-key.enum';
import { SystemEmailSender } from '@domain/enums/mail/system-email-sender.enum';
import { type MailerPort, MAILER_PORT } from '@domain/interfaces/mailer.port';
import { emailBranding } from '@domain/constants/email-branding';
import { SUPPORTED_LOCALES } from '@domain/constants/supported-locales.constant';

@Injectable()
export class EmailVerificationUseCase {
  private readonly otpStore = new Map<
    string,
    { code: string; expiresAt: number }
  >();
  private readonly TTL_MS = 10 * 60 * 1000;

  constructor(@Inject(MAILER_PORT) private readonly mailer: MailerPort) {}

  async sendVerificationEmail(dto: SendVerificationEmailDto): Promise<void> {
    if (!SUPPORTED_LOCALES.includes(dto.locale)) {
      throw new BadRequestException(`Unsupported locale: ${dto.locale}`);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    this.otpStore.set(dto.email, {
      code,
      expiresAt: Date.now() + this.TTL_MS,
    });

    const branding = emailBranding[dto.locale];

    await this.mailer.sendTemplatedEmail({
      to: dto.email,
      locale: dto.locale,
      senderKey: SystemEmailSender.NO_REPLY,
      templateKey: MailTemplateKey.EMAIL_VERIFICATION,
      context: {
        code,
        branding,
        year: new Date().getFullYear(),
      },
    });
  }

  verifyOtp(email: string, code: string): void {
    const entry = this.otpStore.get(email);

    if (!entry) {
      throw new UnauthorizedException('Invalid or expired OTP code');
    }

    if (Date.now() > entry.expiresAt) {
      this.otpStore.delete(email);
      throw new UnauthorizedException('OTP code has expired');
    }

    if (entry.code !== code) {
      throw new UnauthorizedException('Incorrect OTP code');
    }

    this.otpStore.delete(email);
  }
}
