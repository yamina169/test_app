import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SubmissionType } from '@common/enums/submission.enum';

export class CreateSubmissionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(SubmissionType)
  submissionType: SubmissionType;
}
