import {
  SubmissionStatus,
  SubmissionType,
} from '@common/enums/submission.enum';

export class Submission {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly status: SubmissionStatus,
    public readonly submissionType: SubmissionType,
    public readonly userId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
