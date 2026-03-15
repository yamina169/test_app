import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SubmissionType } from '@common/enums/submission.enum';

@InputType()
export class CreateSubmissionInput {
  @IsNotEmpty()
  @IsString()
  @Field()
  title: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  description?: string;

  @IsNotEmpty()
  @IsEnum(SubmissionType)
  @Field(() => SubmissionType)
  submissionType: SubmissionType;
}
