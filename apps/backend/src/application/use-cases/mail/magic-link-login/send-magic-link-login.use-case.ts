import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IUserRepository } from '@domain/interfaces/user.repository.interface';
import type { TokenPort, TokenPayload } from '@domain/interfaces/token.port';
import { type MailerPort, MAILER_PORT } from '@domain/interfaces/mailer.port';
import { TOKEN_PORT } from '@domain/interfaces/token.port';
import { MailTemplateKey } from '@domain/enums/mail/mail-template-key.enum';
import { SystemEmailSender } from '@domain/enums/mail/system-email-sender.enum';
import { emailBranding } from '@domain/constants/email-branding';
import { SendVerificationEmailDto } from '@application/dto/mail/send-verification-email.dto';

@Injectable()
export class SendMagicLinkLoginUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject(MAILER_PORT) private readonly mailer: MailerPort,
    @Inject(TOKEN_PORT) private readonly tokenService: TokenPort,
    @Inject('FRONTEND_URL') private readonly frontendUrl: string,
  ) {}

  async send(dto: SendVerificationEmailDto): Promise<void> {
    const { email, locale } = dto;

    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const token = this.tokenService.sign(
      {
        sub: String(user.id),
        email: user.email,
        roles: [String(user.roleId)],
      },
      '30',
    );

    const loginUrl = `${this.frontendUrl}/${locale}/dashboard/${user.id}?token=${token}`;

    await this.mailer.sendTemplatedEmail({
      to: user.email,
      locale,
      senderKey: SystemEmailSender.NO_REPLY,
      templateKey: MailTemplateKey.MAGIC_LINK_LOGIN,
      context: {
        loginUrl,
        branding: emailBranding[locale],
        year: new Date().getFullYear(),
      },
    });
  }

  verify(token: string): { accessToken: string } {
    let payload: TokenPayload;

    try {
      payload = this.tokenService.verify<TokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired link');
    }

    const accessToken = this.tokenService.sign({
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles,
    });

    return { accessToken };
  }
}
