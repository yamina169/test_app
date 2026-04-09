import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@infrastructure/database/entities/user.entity';
import { UserRepository } from '@infrastructure/repositories/user.repository';

import { MAILER_PORT } from '@domain/interfaces/mailer.port';
import { TOKEN_PORT } from '@domain/interfaces/token.port';

import { SmtpMailerAdapter } from '@infrastructure/integrations/mail/adapters/smtp-mailer.adapter';
import { HandlebarsTemplateRenderer } from '@infrastructure/integrations/mail/renderers/handlebars-template.renderer';
import { SystemEmailRegistry } from '@infrastructure/integrations/mail/registry/system-email.registry';
import { JwtTokenAdapter } from '@infrastructure/integrations/jwt/jwt-token.adapter';

import { SendContactFormSubmittedEmailUseCase } from '@application/use-cases/mail/contact-us/send-contact-form-submitted-email.use-case';
import { EmailVerificationUseCase } from '@application/use-cases/mail/email-verification/email-verification.use-case';
import { SendMagicLinkLoginUseCase } from '@application/use-cases/mail/magic-link-login/send-magic-link-login.use-case';
import { SendResetPasswordEmailUseCase } from '@application/use-cases/mail/email-reset-password/send-reset-password-email.use-case';

import { MailResolver } from '@presentation/resolvers/mail.resolver';

import appConfig from '@infrastructure/config/env/app.config';
import mailConfig from '@infrastructure/config/env/mail.config';

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    ConfigModule.forFeature(mailConfig),
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [
    HandlebarsTemplateRenderer,
    SystemEmailRegistry,

    SendContactFormSubmittedEmailUseCase,
    EmailVerificationUseCase,
    SendMagicLinkLoginUseCase,
    SendResetPasswordEmailUseCase,

    MailResolver,

    { provide: MAILER_PORT, useClass: SmtpMailerAdapter },
    { provide: TOKEN_PORT, useClass: JwtTokenAdapter },
    JwtTokenAdapter,

    { provide: 'IUserRepository', useClass: UserRepository },
    {
      provide: 'FRONTEND_URL',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        config.getOrThrow<string>('app.frontendUrl'),
    },
  ],
  exports: [
    SendContactFormSubmittedEmailUseCase,
    EmailVerificationUseCase,
    SendMagicLinkLoginUseCase,
    SendResetPasswordEmailUseCase,
    MAILER_PORT,
    TOKEN_PORT,
  ],
})
export class MailModule {}
