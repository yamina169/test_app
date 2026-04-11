// presentation/graphql/inputs/reset-password/reset-password.input.ts

import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, Length, MinLength } from 'class-validator';

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @Length(6, 6)
  code!: string;

  @Field()
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
