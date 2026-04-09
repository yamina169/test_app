import type { SupportedLocale } from '@domain/constants/supported-locales.constant';
import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { SUPPORTED_LOCALES } from '@domain/constants/supported-locales.constant';

export class LoginWithHandicapCardDto {
  @IsNotEmpty()
  @IsString()
  handicapCardId!: string;

  @IsNotEmpty()
  @IsIn(SUPPORTED_LOCALES)
  locale!: SupportedLocale;
}
