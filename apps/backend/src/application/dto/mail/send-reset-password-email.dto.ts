import { IsEmail, IsIn, IsInt, Min } from 'class-validator';
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@domain/constants/supported-locales.constant';

export class SendResetPasswordEmailDto {
  @IsEmail()
  email!: string;

  @IsIn(SUPPORTED_LOCALES)
  locale!: SupportedLocale;

  @IsInt()
  @Min(1)
  expiresInMinutes!: number;

  code!: string;
}
