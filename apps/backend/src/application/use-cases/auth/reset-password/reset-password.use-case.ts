import type { IUserRepository } from '@domain/interfaces/user.repository.interface';
import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import type { SupportedLocale } from '@domain/constants/supported-locales.constant';
import { ResetPasswordDto } from '@application/dto/auth/reset-password.dto';
import { SendResetPasswordEmailUseCase } from '../../mail/email-reset-password/send-reset-password-email.use-case';

const OTP_EXPIRY_MINUTES = 10;

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly sendResetPasswordEmailUseCase: SendResetPasswordEmailUseCase,
  ) {}

  async requestOtp(
    dto: Pick<ResetPasswordDto, 'email'>,
    locale: SupportedLocale,
  ): Promise<void> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new Error(`User with email ${dto.email} not found`);

    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.userRepository.saveOtp(user.id, code, expiresAt);

    try {
      await this.sendResetPasswordEmailUseCase.execute({
        email: user.email,
        locale,
        code,
        expiresInMinutes: OTP_EXPIRY_MINUTES,
      });
    } catch (err: unknown) {
      throw new Error(`Failed to send OTP email: ${getErrorMessage(err)}`);
    }
  }

  async resetPassword(dto: Required<ResetPasswordDto>): Promise<void> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new Error('User not found');

    const otpData = user.otpData;
    if (!otpData || !otpData.isValid())
      throw new Error('OTP expired or not requested');
    if (otpData.code !== dto.code) throw new Error('Invalid OTP code');

    await this.userRepository.clearOtp(user.id);

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.updatePassword(user.id, hashedPassword);
  }
}
