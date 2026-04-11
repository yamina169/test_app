import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { TokenPort, TokenPayload } from '@domain/interfaces/token.port';
import type { StringValue } from 'ms';

@Injectable()
export class JwtTokenAdapter implements TokenPort {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  sign(payload: TokenPayload, expiresIn: StringValue = '15m'): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET is not defined');

    return this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });
  }

  verify<T extends TokenPayload = TokenPayload>(token: string): T {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET is not defined');

    return this.jwtService.verify<T>(token, { secret });
  }

  signRefreshToken(payload: TokenPayload): string {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined');

    return this.jwtService.sign(payload, {
      secret,
      expiresIn: '7d' as StringValue,
    });
  }

  verifyRefreshToken<T extends TokenPayload = TokenPayload>(token: string): T {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined');

    return this.jwtService.verify<T>(token, { secret });
  }
}
