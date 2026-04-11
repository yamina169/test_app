import { CreateSubmissionUseCase } from './create-submission.use-case';
import { Submission } from '@domain/entities/submission.entity';
import {
  SubmissionStatus,
  SubmissionType,
} from '@domain/enums/submission.enum';
import type { ISubmissionRepository } from '@domain/interfaces/submission.repository.interface';
import type { IUnitOfWork } from '@domain/interfaces/unit-of-work.interface';

const saveMock = jest.fn();
const uowSaveMock = jest.fn();

const mockSubmissionRepository: jest.Mocked<ISubmissionRepository> = {
  save: saveMock,
} as unknown as jest.Mocked<ISubmissionRepository>;

const mockUow = {
  submissionRepository: { save: uowSaveMock },
} as unknown as IUnitOfWork;

const makeUseCase = () => new CreateSubmissionUseCase(mockSubmissionRepository);

const dto = {
  title: 'Registration Submission',
  description: undefined,
  submissionType: SubmissionType.REGISTRATION_HANDICAP_USER,
};

const makeSavedSubmission = (id: string): Submission => ({
  id,
  title: dto.title,
  description: null,
  status: SubmissionStatus.PENDING,
  submissionType: dto.submissionType,
  userId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
});

beforeEach(() => jest.clearAllMocks());

describe('CreateSubmissionUseCase', () => {
  it('saves submission using injected repository when no uow provided', async () => {
    const saved = makeSavedSubmission('sub-1');
    saveMock.mockResolvedValue(saved);

    const result = await makeUseCase().execute(dto, 'user-1');

    expect(saveMock).toHaveBeenCalled();
    expect(result).toEqual(saved);
  });

  it('uses uow repository when uow is provided', async () => {
    const saved = makeSavedSubmission('sub-2');
    uowSaveMock.mockResolvedValue(saved);

    const result = await makeUseCase().execute(dto, 'user-1', 'sub-2', mockUow);

    expect(uowSaveMock).toHaveBeenCalled();
    expect(saveMock).not.toHaveBeenCalled();
    expect(result).toEqual(saved);
  });

  it('uses provided submissionId when given', async () => {
    saveMock.mockImplementation((s: Submission) => Promise.resolve(s));

    const result = await makeUseCase().execute(dto, 'user-1', 'fixed-id');

    expect(result.id).toBe('fixed-id');
  });
});
