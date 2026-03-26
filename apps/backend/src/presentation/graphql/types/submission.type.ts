import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  SubmissionStatus,
  SubmissionType as SubmissionTypeEnum,
} from '@domain/enums/submission.enum';

registerEnumType(SubmissionStatus, { name: 'SubmissionStatus' });
registerEnumType(SubmissionTypeEnum, { name: 'SubmissionType' });

@ObjectType('Submission')
export class SubmissionObjectType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => SubmissionTypeEnum)
  submissionType: SubmissionTypeEnum;

  @Field(() => SubmissionStatus)
  status: SubmissionStatus;

  @Field()
  userId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
