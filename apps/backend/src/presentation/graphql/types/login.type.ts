import { ObjectType, Field } from '@nestjs/graphql';
import { UserObjectType } from './user.type';

@ObjectType()
export class LoginType {
  @Field()
  accessToken: string;

  @Field(() => UserObjectType)
  user: UserObjectType;
}
