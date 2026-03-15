import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { RegisterUserUseCase } from './register.use-case';
import { AccountStatus, OccupationStatus } from '@common/enums/user.enum';
import { SubmissionType } from '@common/enums/submission.enum';
import { DocumentType } from '@common/enums/document.enum';
import type { IUnitOfWork } from '@domain/interfaces/unit-of-work.interface';
import type { IUserRepository } from '@domain/interfaces/user.repository.interface';
import type { IRoleRepository } from '@domain/interfaces/role.repository.interface';
import type { IStorageService } from '@domain/interfaces/storage.service.interface';
import type { CreateSubmissionUseCase } from '../submission/create-submission.use-case';
import type { CreateDocumentUseCase } from '../document/create-document.use-case';

const mockUow: {
  begin: jest.Mock;
  commit: jest.Mock;
  rollback: jest.Mock;
  userRepository: { save: jest.Mock };
  submissionRepository: { save: jest.Mock };
  documentRepository: { save: jest.Mock };
} = {
  begin: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
  userRepository: { save: jest.fn() },
  submissionRepository: { save: jest.fn() },
  documentRepository: { save: jest.fn() },
};

const mockUserRepository = { findByEmail: jest.fn() };
const mockRoleRepository = { findById: jest.fn() };
const mockStorageService = { uploadFile: jest.fn(), deleteFile: jest.fn() };
const mockCreateSubmissionUseCase = { execute: jest.fn() };
const mockCreateDocumentUseCase = { execute: jest.fn() };

const makeUseCase = () =>
  new RegisterUserUseCase(
    mockUow as unknown as IUnitOfWork,
    mockUserRepository as unknown as IUserRepository,
    mockRoleRepository as unknown as IRoleRepository,
    mockStorageService as unknown as IStorageService,
    mockCreateSubmissionUseCase as unknown as CreateSubmissionUseCase,
    mockCreateDocumentUseCase as unknown as CreateDocumentUseCase,
  );

const baseDto = {
  fullName: 'Yamina Test',
  email: 'yamina@test.tn',
  phone: '+21612345678',
  password: 'Password123!',
  roleId: 1,
};

const handicapDto = {
  ...baseDto,
  dateOfBirth: new Date('1995-05-12'),
  governorate: 'Tunis',
  city: 'Carthage',
  handicapType: 'Visual',
  requiredAccommodation: ['Braille'],
  occupationStatus: OccupationStatus.STUDENT,
  caregiver: false,
};

const makeFile = (
  content: string,
  documentType = DocumentType.PROOF_OF_HANDICAP,
) => ({
  file: {
    buffer: Buffer.from(content),
    fileName: 'f.pdf',
    mimeType: 'application/pdf',
  },
  documentType,
});

beforeEach(() => jest.clearAllMocks());

describe('RegisterUserUseCase', () => {
  it('throws NotFoundException when role does not exist', async () => {
    mockRoleRepository.findById.mockResolvedValue(null);
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(makeUseCase().execute(baseDto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws ConflictException when email already in use', async () => {
    mockRoleRepository.findById.mockResolvedValue({ id: 1, type: 'BASIC' });
    mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing-user' });

    await expect(makeUseCase().execute(baseDto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('saves user and commits transaction for a basic role with no files', async () => {
    const savedUser = {
      id: 'user-123',
      ...baseDto,
      status: AccountStatus.PENDING,
    };
    mockRoleRepository.findById.mockResolvedValue({ id: 1, type: 'BASIC' });
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUow.userRepository.save.mockResolvedValue(savedUser);

    const result = await makeUseCase().execute(baseDto, []);

    expect(mockUow.begin).toHaveBeenCalled();
    expect(mockUow.commit).toHaveBeenCalled();
    expect(mockUow.rollback).not.toHaveBeenCalled();
    expect(result).toEqual(savedUser);
  });

  it('throws BadRequestException when HANDICAP_USER role has no files', async () => {
    mockRoleRepository.findById.mockResolvedValue({
      id: 2,
      type: 'HANDICAP_USER',
    });
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(makeUseCase().execute(baseDto, [])).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws BadRequestException when duplicate files are provided', async () => {
    mockRoleRepository.findById.mockResolvedValue({
      id: 2,
      type: 'HANDICAP_USER',
    });
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const duplicateFile = makeFile('same-content');
    await expect(
      makeUseCase().execute(handicapDto, [duplicateFile, duplicateFile]),
    ).rejects.toThrow(BadRequestException);

    expect(mockUow.begin).not.toHaveBeenCalled();
  });

  it('rollbacks DB transaction when commit fails', async () => {
    const savedUser = { id: 'user-123', ...baseDto };
    mockRoleRepository.findById.mockResolvedValue({ id: 1, type: 'BASIC' });
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUow.userRepository.save.mockResolvedValue(savedUser);
    mockUow.commit.mockRejectedValue(new Error('DB commit failed'));

    await expect(makeUseCase().execute(baseDto, [])).rejects.toThrow(
      'DB commit failed',
    );

    expect(mockUow.rollback).toHaveBeenCalled();
  });

  it('creates submission and documents for HANDICAP_USER role', async () => {
    const savedUser = { id: 'user-123', ...handicapDto };
    mockRoleRepository.findById.mockResolvedValue({
      id: 2,
      type: 'HANDICAP_USER',
    });
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUow.userRepository.save.mockResolvedValue(savedUser);
    mockUow.commit.mockResolvedValue(undefined);
    mockStorageService.deleteFile.mockResolvedValue(undefined);
    mockCreateSubmissionUseCase.execute.mockResolvedValue({ id: 'sub-1' });
    mockCreateDocumentUseCase.execute.mockResolvedValue({
      id: 'doc-1',
      fileUrl: 'https://minio/f.pdf',
    });

    const result = await makeUseCase().execute(handicapDto, [
      makeFile('file-1'),
    ]);

    expect(mockCreateSubmissionUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        submissionType: SubmissionType.REGISTRATION_HANDICAP_USER,
      }),
      expect.any(String),
      expect.any(String),
      mockUow,
    );
    expect(mockCreateDocumentUseCase.execute).toHaveBeenCalled();
    expect(mockUow.commit).toHaveBeenCalled();
    expect(result).toEqual(savedUser);
  });
});
