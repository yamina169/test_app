import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@domain/constants/supported-locales.constant';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class SendContactFormSubmittedEmailDto {
  @IsEmail()
  email!: string;

  @IsIn(SUPPORTED_LOCALES)
  locale!: SupportedLocale;

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsOptional()
  @IsString()
  reference?: string;
}
