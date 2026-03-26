import { SendContactFormSubmittedEmailUseCase } from '@application/use-cases/mail/contact-us/send-contact-form-submitted-email.use-case';
import { EmailVerificationUseCase } from '@application/use-cases/mail/email-verification/email-verification.use-case';

import { MAILER_PORT } from '@domain/interfaces/mailer.port';
import { TOKEN_PORT } from '@domain/interfaces/token.port';
import appConfig from '@infrastructure/config/env/app.config';
import mailConfig from '@infrastructure/config/env/mail.config';

import { SmtpMailerAdapter } from '@infrastructure/integrations/mail/adapters/smtp-mailer.adapter';
import { JwtTokenAdapter } from '@infrastructure/integrations/jwt/jwt-token.adapter';

import { SystemEmailRegistry } from '@infrastructure/integrations/mail/registry/system-email.registry';
import { HandlebarsTemplateRenderer } from '@infrastructure/integrations/mail/renderers/handlebars-template.renderer';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { MailResolver } from '@presentation/resolvers/mail.resolver';

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    ConfigModule.forFeature(mailConfig),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [
    HandlebarsTemplateRenderer,
    SystemEmailRegistry,

    SendContactFormSubmittedEmailUseCase,
    EmailVerificationUseCase,

    MailResolver,

    { provide: MAILER_PORT, useClass: SmtpMailerAdapter },
    { provide: TOKEN_PORT, useClass: JwtTokenAdapter },
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
    MAILER_PORT,
    TOKEN_PORT,
  ],
})
export class MailModule {}
