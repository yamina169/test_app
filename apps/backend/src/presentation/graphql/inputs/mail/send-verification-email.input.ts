import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsIn } from 'class-validator';
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@domain/constants/supported-locales.constant';

@InputType()
export class SendVerificationEmailInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsIn(SUPPORTED_LOCALES)
  locale: SupportedLocale;
}
