import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@domain/constants/supported-locales.constant';

@InputType()
export class TestContactEmailInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  subject!: string;

  @Field()
  @IsIn(SUPPORTED_LOCALES)
  locale!: SupportedLocale;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reference?: string;
}
