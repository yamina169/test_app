import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { MailerPort } from '@domain/interfaces/mailer.port';
import { MAILER_PORT } from '@domain/interfaces/mailer.port';
import type { IUserRepository } from '@domain/interfaces/user.repository.interface';
import { SendResetPasswordEmailDto } from '@application/dto/mail/send-reset-password-email.dto';
import { MailTemplateKey } from '@domain/enums/mail/mail-template-key.enum';
import { SystemEmailSender } from '@domain/enums/mail/system-email-sender.enum';
import { emailBranding } from '@domain/constants/email-branding';
import { SUPPORTED_LOCALES } from '@domain/constants/supported-locales.constant';

@Injectable()
export class SendResetPasswordEmailUseCase {
  constructor(
    @Inject(MAILER_PORT) private readonly mailer: MailerPort,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: SendResetPasswordEmailDto): Promise<void> {
    if (!SUPPORTED_LOCALES.includes(dto.locale)) {
      throw new BadRequestException(`Unsupported locale: ${dto.locale}`);
    }

    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('Email not found');
    }

    await this.mailer.sendTemplatedEmail({
      to: dto.email,
      locale: dto.locale,
      senderKey: SystemEmailSender.NO_REPLY,
      templateKey: MailTemplateKey.RESET_PASSWORD_OTP,
      context: {
        code: dto.code,
        expiresInMinutes: dto.expiresInMinutes,
        branding: emailBranding[dto.locale],
        year: new Date().getFullYear(),
      },
    });
  }
}
