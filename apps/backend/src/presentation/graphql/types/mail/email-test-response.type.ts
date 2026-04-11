import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EmailTestResponse {
  @Field()
  success!: boolean;

  @Field()
  message!: string;
}
