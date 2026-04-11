import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@infrastructure/database/entities/user.entity';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { UnitOfWork } from '@infrastructure/unit-of-work';
import { UserRepository } from '@infrastructure/repositories/user.repository';

import { JwtTokenAdapter } from '@infrastructure/integrations/jwt/jwt-token.adapter';
import { JwtStrategy } from '@infrastructure/integrations/jwt/jwt.strategy';

import { MailModule } from '@infrastructure/integrations/mail/mail.module';
import { MinioModule } from '@infrastructure/integrations/minio/minio.module';

import { RegisterUserUseCase } from '@application/use-cases/auth/register/register.use-case';
import { LoginUseCase } from '@application/use-cases/auth/login/login.use-case';
import { ResetPasswordUseCase } from '@application/use-cases/auth/reset-password/reset-password.use-case';
import { SendResetPasswordEmailUseCase } from '@application/use-cases/mail/email-reset-password/send-reset-password-email.use-case';
import { SendMagicLinkLoginUseCase } from '@application/use-cases/mail/magic-link-login/send-magic-link-login.use-case';

import { AuthResolver } from '@presentation/resolvers/auth.resolver';

import { TOKEN_PORT } from '@domain/interfaces/token.port';

import { RoleModule } from './role.module';
import { DocumentModule } from './document.module';
import { SubmissionModule } from './submission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    DatabaseModule,
    MinioModule,
    MailModule,
    RoleModule,
    DocumentModule,
    SubmissionModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
    { provide: 'IUserRepository', useClass: UserRepository },
    { provide: 'IUnitOfWork', useClass: UnitOfWork },
    { provide: TOKEN_PORT, useClass: JwtTokenAdapter },
    {
      provide: 'FRONTEND_URL',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        config.getOrThrow<string>('FRONTEND_URL'),
    },
    JwtStrategy,
    JwtTokenAdapter,
    RegisterUserUseCase,
    LoginUseCase,
    SendMagicLinkLoginUseCase,
    SendResetPasswordEmailUseCase,
    ResetPasswordUseCase,
    AuthResolver,
  ],
  exports: [
    'IUserRepository',
    'IUnitOfWork',
    TOKEN_PORT,
    RegisterUserUseCase,
    LoginUseCase,
    ResetPasswordUseCase,
  ],
})
export class AuthModule {}
