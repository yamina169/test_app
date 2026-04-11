import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class LoginWithEmailInput {
  @IsEmail()
  @Field()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Field()
  password!: string;
}
