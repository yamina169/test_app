import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsIn } from 'class-validator';
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@domain/constants/supported-locales.constant';

@InputType()
export class SendEmailInput {
  @Field(() => String)
  @IsEmail()
  email!: string;

  @Field(() => String)
  @IsIn(SUPPORTED_LOCALES)
  locale!: SupportedLocale;
}
