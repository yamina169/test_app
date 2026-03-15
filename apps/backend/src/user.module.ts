import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '@domain/entities/user.entity';
import { UserRepository } from '@infrastructure/repositories/user.repository';
import { RegisterUserUseCase } from '@application/use-cases/auth/register.use-case';
import { LoginUseCase } from '@application/use-cases/auth/login.use-case';
import { JwtStrategy } from '@common/strategy/jwt.strategy';
import { UserResolver } from '@presentation/resolvers/user.resolver';
import { AuthResolver } from '@presentation/resolvers/auth.resolver';
import { USER_REPOSITORY } from '@domain/interfaces/user.repository.interface';
import { SubmissionModule } from './submission.module';
import { DocumentModule } from './document.module';
import { RoleModule } from './role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    SubmissionModule,
    DocumentModule,
    RoleModule,
  ],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepository },
    RegisterUserUseCase,
    LoginUseCase,
    JwtStrategy,
    UserResolver,
    AuthResolver, // ← ajouter
  ],
  exports: [USER_REPOSITORY, RegisterUserUseCase, LoginUseCase],
})
export class UserModule {}
