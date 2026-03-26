import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

@InputType()
export class TestContactEmailInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  subject!: string;

  @Field()
  @IsIn(['en', 'fr', 'ar'])
  locale!: 'en' | 'fr' | 'ar';

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reference?: string;
}
