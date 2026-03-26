import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { TokenPort } from '@domain/interfaces/token.port';
import type { StringValue } from 'ms';

@Injectable()
export class JwtTokenAdapter implements TokenPort {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: Record<string, unknown>, expiresIn?: string): string {
    const options: JwtSignOptions = expiresIn
      ? { expiresIn: expiresIn as StringValue }
      : {};
    return this.jwtService.sign(payload, options);
  }

  verify<T extends object>(token: string): T {
    return this.jwtService.verify<T>(token);
  }
}
