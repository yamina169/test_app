import { SubmissionType } from '@domain/enums/submission.enum';

export class Role {
  constructor(
    public readonly id: number,
    public readonly type: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  getSubmissionType(): SubmissionType | null {
    const map: Partial<Record<string, SubmissionType>> = {
      HANDICAP_USER: SubmissionType.REGISTRATION_HANDICAP_USER,
      INSTITUTION_ADMIN: SubmissionType.REGISTRATION_INSTITUTION,
    };
    return map[this.type] ?? null;
  }
}
