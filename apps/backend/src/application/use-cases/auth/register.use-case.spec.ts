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

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockUow = {
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
  handicapCardId: 'HC-2024-001',
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

const uploadedFile = { fileName: 'f.pdf', fileUrl: 'https://minio/f.pdf' };

beforeEach(() => jest.clearAllMocks());

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('RegisterUserUseCase', () => {
  it('throws NotFoundException when role does not exist', async () => {
    mockRoleRepository.findById.mockResolvedValue(null);

    await expect(makeUseCase().execute(baseDto)).rejects.toThrow(
      NotFoundException,
    );

    expect(mockUow.begin).not.toHaveBeenCalled();
  });

  it('throws ConflictException when email already in use (DB unique violation)', async () => {
    mockRoleRepository.findById.mockResolvedValue({ id: 1, type: 'BASIC' });
    const dbError = Object.assign(new Error('unique violation'), {
      code: '23505',
    });
    mockUow.userRepository.save.mockRejectedValue(dbError);

    await expect(makeUseCase().execute(baseDto)).rejects.toThrow(
      ConflictException,
    );

    expect(mockUow.rollback).toHaveBeenCalled();
  });

  it('saves user and commits transaction for a basic role with no files', async () => {
    const savedUser = {
      id: 'user-123',
      ...baseDto,
      status: AccountStatus.PENDING,
    };
    mockRoleRepository.findById.mockResolvedValue({ id: 1, type: 'BASIC' });
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

    await expect(makeUseCase().execute(baseDto, [])).rejects.toThrow(
      BadRequestException,
    );

    expect(mockUow.begin).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when duplicate files are provided', async () => {
    mockRoleRepository.findById.mockResolvedValue({
      id: 2,
      type: 'HANDICAP_USER',
    });

    const duplicate = makeFile('same-content');
    await expect(
      makeUseCase().execute(handicapDto, [duplicate, duplicate]),
    ).rejects.toThrow(BadRequestException);

    expect(mockUow.begin).not.toHaveBeenCalled();
  });

  it('rollbacks DB transaction when commit fails', async () => {
    const savedUser = { id: 'user-123', ...baseDto };
    mockRoleRepository.findById.mockResolvedValue({ id: 1, type: 'BASIC' });
    mockUow.userRepository.save.mockResolvedValue(savedUser);
    mockUow.commit.mockRejectedValue(new Error('DB commit failed'));

    await expect(makeUseCase().execute(baseDto, [])).rejects.toThrow(
      'DB commit failed',
    );

    expect(mockUow.rollback).toHaveBeenCalled();
  });

  it('still throws original error when rollback also fails', async () => {
    mockRoleRepository.findById.mockResolvedValue({ id: 1, type: 'BASIC' });
    mockUow.userRepository.save.mockRejectedValue(new Error('DB save failed'));
    mockUow.rollback.mockRejectedValue(new Error('Rollback failed'));

    await expect(makeUseCase().execute(baseDto, [])).rejects.toThrow(
      'DB save failed',
    );
  });

  it('creates submission and documents for HANDICAP_USER role', async () => {
    const savedUser = { id: 'user-123', ...handicapDto };
    mockRoleRepository.findById.mockResolvedValue({
      id: 2,
      type: 'HANDICAP_USER',
    });
    mockUow.userRepository.save.mockResolvedValue(savedUser);
    mockUow.commit.mockResolvedValue(undefined);
    mockStorageService.uploadFile.mockResolvedValue(uploadedFile);
    mockCreateSubmissionUseCase.execute.mockResolvedValue({ id: 'sub-1' });
    mockCreateDocumentUseCase.execute.mockResolvedValue({
      id: 'doc-1',
      ...uploadedFile,
    });

    const result = await makeUseCase().execute(handicapDto, [
      makeFile('file-1'),
    ]);

    expect(mockStorageService.uploadFile).toHaveBeenCalled();
    expect(mockCreateSubmissionUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        submissionType: SubmissionType.REGISTRATION_HANDICAP_USER,
      }),
      expect.any(String),
      expect.any(String),
      mockUow,
    );
    expect(mockCreateDocumentUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ buffer: expect.any(Buffer) }),
      DocumentType.PROOF_OF_HANDICAP,
      expect.any(String),
      mockUow,
      uploadedFile,
    );
    expect(mockUow.commit).toHaveBeenCalled();
    expect(result).toEqual(savedUser);
  });

  it('rollbacks MinIO uploads when transaction fails after file upload', async () => {
    const savedUser = { id: 'user-123', ...handicapDto };
    mockRoleRepository.findById.mockResolvedValue({
      id: 2,
      type: 'HANDICAP_USER',
    });
    mockUow.userRepository.save.mockResolvedValue(savedUser);
    mockStorageService.uploadFile.mockResolvedValue(uploadedFile);
    mockCreateSubmissionUseCase.execute.mockResolvedValue({ id: 'sub-1' });
    mockCreateDocumentUseCase.execute.mockRejectedValue(
      new Error('DB save failed'),
    );
    mockStorageService.deleteFile.mockResolvedValue(undefined);

    await expect(
      makeUseCase().execute(handicapDto, [makeFile('file-1')]),
    ).rejects.toThrow('DB save failed');

    expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
      uploadedFile.fileUrl,
    );
    expect(mockUow.rollback).toHaveBeenCalled();
  });

  it('rollbacks all uploaded files when multiple files are provided and one fails', async () => {
    const savedUser = { id: 'user-123', ...handicapDto };
    mockRoleRepository.findById.mockResolvedValue({
      id: 2,
      type: 'HANDICAP_USER',
    });
    mockUow.userRepository.save.mockResolvedValue(savedUser);
    mockCreateSubmissionUseCase.execute.mockResolvedValue({ id: 'sub-1' });

    const url1 = 'https://minio/f1.pdf';
    const url2 = 'https://minio/f2.pdf';

    mockStorageService.uploadFile
      .mockResolvedValueOnce({ fileName: 'f1.pdf', fileUrl: url1 })
      .mockResolvedValueOnce({ fileName: 'f2.pdf', fileUrl: url2 });

    mockCreateDocumentUseCase.execute
      .mockResolvedValueOnce({ id: 'doc-1', fileUrl: url1 })
      .mockRejectedValueOnce(new Error('DB save failed'));

    mockStorageService.deleteFile.mockResolvedValue(undefined);

    await expect(
      makeUseCase().execute(handicapDto, [
        makeFile('file-1'),
        makeFile('file-2'),
      ]),
    ).rejects.toThrow('DB save failed');

    expect(mockStorageService.deleteFile).toHaveBeenCalledWith(url1);
    expect(mockStorageService.deleteFile).toHaveBeenCalledWith(url2);
  });
});
