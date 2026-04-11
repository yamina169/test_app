import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { IUserRepository } from '@domain/interfaces/user.repository.interface';
import type { TokenPort } from '@domain/interfaces/token.port';
import { TOKEN_PORT } from '@domain/interfaces/token.port';
import { LoginWithEmailDto } from '@application/dto/auth/login/login-with-email.dto';
import { LoginWithHandicapCardDto } from '@application/dto/auth/login/login-with-handicap-card.dto';
import { SendMagicLinkLoginUseCase } from '@application/use-cases/mail/magic-link-login/send-magic-link-login.use-case';
import { AccountStatus } from '@domain/enums/user.enum';
import { User } from '@domain/entities/user.entity';
@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject(TOKEN_PORT)
    private readonly tokenService: TokenPort,
    private readonly sendMagicLinkLoginUseCase: SendMagicLinkLoginUseCase,
  ) {}

  async execute(dto: LoginWithEmailDto | LoginWithHandicapCardDto) {
    if ('handicapCardId' in dto) {
      return this.handleHandicapCardLogin(dto);
    }
    return this.handleEmailLogin(dto);
  }

  private async handleEmailLogin(dto: LoginWithEmailDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    this.assertActive(user);

    const payload = {
      sub: String(user.id),
      email: user.email,
      roles: [String(user.roleId)],
    };

    const accessToken = this.tokenService.sign(payload);
    const refreshToken = this.tokenService.signRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async handleHandicapCardLogin(dto: LoginWithHandicapCardDto) {
    const user = await this.userRepository.findByHandicapCardId(
      dto.handicapCardId,
    );
    if (!user) throw new UnauthorizedException('Invalid handicap card');

    if (user.status === AccountStatus.PENDING) {
      throw new UnauthorizedException('Email not confirmed');
    }

    this.assertActive(user);

    await this.sendMagicLinkLoginUseCase.send({
      email: user.email,
      locale: dto.locale,
    });

    return { magicLinkSent: true };
  }

  private assertActive(user: User) {
    if (user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Account inactive or suspended');
    }
  }
}
