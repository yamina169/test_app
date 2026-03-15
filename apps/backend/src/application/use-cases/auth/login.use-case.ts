import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '@application/dto/auth/login.dto';
import type { IUserRepository } from '@domain/interfaces/user.repository.interface';
import { USER_REPOSITORY } from '@domain/interfaces/user.repository.interface';

import { AccountStatus } from '@common/enums/user.enum';
import { User } from '@domain/entities/user.entity';

const HANDICAP_ROLE = 'HANDICAP_USER';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto): Promise<{ accessToken: string; user: User }> {
    // cas 1: card_id only → HANDICAP_USER
    if (dto.card_id && !dto.email && !dto.password) {
      return this.loginByCardId(dto.card_id);
    }

    // cas 2: email + password → les 2 rôles
    if (dto.email && dto.password) {
      return this.loginByEmail(dto.email, dto.password);
    }

    // cas 3: tout le reste → rejeté
    throw new BadRequestException('Provide email + password, or card_id only');
  }
  private async loginByCardId(
    card_id: string, // ← number → string
  ): Promise<{ accessToken: string; user: User }> {
    const user = await this.userRepository.findByCardId(card_id);

    if (!user) {
      throw new UnauthorizedException('Invalid card ID');
    }

    if (user.role?.type !== HANDICAP_ROLE) {
      throw new UnauthorizedException(
        'card_id login is only allowed for handicap users',
      );
    }

    if (user.status !== AccountStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active');
    }

    return this.generateToken(user);
  }

  private async loginByEmail(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; user: User }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== AccountStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active');
    }

    return this.generateToken(user);
  }

  private generateToken(user: User): { accessToken: string; user: User } {
    const payload = {
      sub: user.id,
      role: user.role?.type,
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, user };
  }
}
