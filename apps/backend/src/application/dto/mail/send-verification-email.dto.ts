import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@domain/constants/supported-locales.constant';
import { IsEmail, IsIn } from 'class-validator';

export class SendVerificationEmailDto {
  @IsEmail()
  email: string;

  @IsIn(SUPPORTED_LOCALES)
  locale: SupportedLocale;
}
