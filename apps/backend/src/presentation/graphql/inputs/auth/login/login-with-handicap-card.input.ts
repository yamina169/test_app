import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { SUPPORTED_LOCALES } from '@domain/constants/supported-locales.constant';
import type { SupportedLocale } from '@domain/constants/supported-locales.constant';

@InputType()
export class LoginWithHandicapCardInput {
  @IsNotEmpty()
  @IsString()
  @Field()
  handicapCardId!: string;

  @IsIn(SUPPORTED_LOCALES)
  @Field(() => String)
  locale!: SupportedLocale;
}
