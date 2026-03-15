import { InputType, Field } from '@nestjs/graphql';
import { LoginDto } from '@application/dto/auth/login.dto';

@InputType()
export class LoginInput extends LoginDto {
  @Field({ nullable: true })
  declare email?: string;

  @Field({ nullable: true })
  declare card_id?: string;

  @Field({ nullable: true })
  declare password?: string;
}
