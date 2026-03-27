import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { RegisterUserDto } from '@application/dto/auth/register.dto';
import { DocumentType } from '@domain/enums/document.enum';
import { SubmissionType } from '@domain/enums/submission.enum';
import { AccountStatus, OccupationStatus } from '@domain/enums/user.enum';
import type { UploadedFile } from '@domain/interfaces/uploaded-file.interface';

import { CreateDocumentUseCase } from '../document/create-document.use-case';
import { EmailVerificationUseCase } from '../mail/email-verification/email-verification.use-case';
import { CreateSubmissionUseCase } from '../submission/create-submission.use-case';
import { RegisterUserUseCase } from './register.use-case';

// ─── Shared constants ────────────────────────────────────────────────────────

const MOCK_UUID = '00000000-0000-0000-0000-000000000001';
const MOCK_TOKEN = 'valid.jwt.token';
const MOCK_EMAIL = 'user@example.com';
const MOCK_FILE_NAME = 'sub-id/abc123.pdf';

const BASE_DTO: RegisterUserDto = {
  fullName: 'Test User',
  email: MOCK_EMAIL,
  phone: '+21600000000',
  password: 'P@ssw0rd!',
  roleId: 1,
  emailVerificationToken: MOCK_TOKEN,
};

const HANDICAP_DTO: RegisterUserDto = {
  ...BASE_DTO,
  dateOfBirth: new Date('1990-01-01'),
  governorate: 'Tunis',
  city: 'Tunis',
  handicapType: 'visual',
  requiredAccommodation: ['braille'],
  occupationStatus: OccupationStatus.EMPLOYED,
  caregiver: false,
  handicapCardId: 'HC-123',
};

const mockFile: UploadedFile = {
  buffer: Buffer.from('file-content'),
  fileName: 'doc.pdf',
  mimeType: 'application/pdf',
};

const mockFileEntry = {
  file: mockFile,
  documentType: DocumentType.PROOF_OF_HANDICAP,
};

const mockUow = {
  begin: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
  userRepository: { save: jest.fn() },
};

const mockUserRepository = {
  findByEmail: jest.fn(),
};

const mockRoleRepository = {
  findById: jest.fn(),
};

const mockStorageService = {
  deleteFile: jest.fn(),
};

const mockCreateSubmissionUseCase = {
  execute: jest.fn(),
};

const mockCreateDocumentUseCase = {
  execute: jest.fn(),
};

const mockEmailVerificationUseCase = {
  validateToken: jest.fn(),
};

function makeRole(type: string) {
  return { id: 1, type };
}

function makeSavedUser() {
  return {
    id: MOCK_UUID,
    email: MOCK_EMAIL,
    accountStatus: AccountStatus.PENDING,
  };
}

function makeSavedDocument(fileName = MOCK_FILE_NAME) {
  return {
    fileName,
    fileUrl: `https://storage/${fileName}`,
  };
}

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-06-15'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        { provide: 'IUnitOfWork', useValue: mockUow },
        { provide: 'IUserRepository', useValue: mockUserRepository },
        { provide: 'IRoleRepository', useValue: mockRoleRepository },
        { provide: 'IStorageService', useValue: mockStorageService },
        {
          provide: CreateSubmissionUseCase,
          useValue: mockCreateSubmissionUseCase,
        },
        { provide: CreateDocumentUseCase, useValue: mockCreateDocumentUseCase },
        {
          provide: EmailVerificationUseCase,
          useValue: mockEmailVerificationUseCase,
        },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('token validation', () => {
    it('should call validateToken with the token and email from the DTO', async () => {
      mockEmailVerificationUseCase.validateToken.mockReturnValue(undefined);
      mockRoleRepository.findById.mockResolvedValue(makeRole('REGULAR'));
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUow.userRepository.save.mockResolvedValue(makeSavedUser());
      mockUow.commit.mockResolvedValue(undefined);

      await useCase.execute(BASE_DTO);

      expect(mockEmailVerificationUseCase.validateToken).toHaveBeenCalledWith(
        MOCK_TOKEN,
        MOCK_EMAIL,
      );
    });

    it('should throw immediately if validateToken throws — no further I/O', async () => {
      mockEmailVerificationUseCase.validateToken.mockImplementation(() => {
        throw new BadRequestException(
          'Verification token is invalid or expired',
        );
      });

      await expect(useCase.execute(BASE_DTO)).rejects.toThrow(
        new BadRequestException('Verification token is invalid or expired'),
      );

      expect(mockRoleRepository.findById).not.toHaveBeenCalled();
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('pre-checks', () => {
    beforeEach(() => {
      mockEmailVerificationUseCase.validateToken.mockReturnValue(undefined);
    });

    it('should throw NotFoundException when the role does not exist', async () => {
      mockRoleRepository.findById.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(BASE_DTO)).rejects.toThrow(
        new NotFoundException('Role not found'),
      );
    });

    it('should throw ConflictException when the email is already in use', async () => {
      mockRoleRepository.findById.mockResolvedValue(makeRole('REGULAR'));
      mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing-id' });

      await expect(useCase.execute(BASE_DTO)).rejects.toThrow(
        new ConflictException('Email already in use'),
      );
    });

    it('should throw BadRequestException when a submission role has no files', async () => {
      mockRoleRepository.findById.mockResolvedValue(makeRole('HANDICAP_USER'));
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(HANDICAP_DTO, [])).rejects.toThrow(
        new BadRequestException('At least one document is required'),
      );
    });
  });

  describe('profile validation', () => {
    beforeEach(() => {
      mockEmailVerificationUseCase.validateToken.mockReturnValue(undefined);
      mockUserRepository.findByEmail.mockResolvedValue(null);
    });

    it('should throw BadRequestException for HANDICAP_USER with missing profile fields', async () => {
      mockRoleRepository.findById.mockResolvedValue(makeRole('HANDICAP_USER'));

      await expect(
        useCase.execute({ ...BASE_DTO }, [mockFileEntry]),
      ).rejects.toThrow(
        new BadRequestException('Missing handicap profile fields'),
      );
    });

    it('should accept caregiver: false as a valid boolean value', async () => {
      mockRoleRepository.findById.mockResolvedValue(makeRole('HANDICAP_USER'));
      mockUow.begin.mockResolvedValue(undefined);
      mockUow.commit.mockResolvedValue(undefined);
      mockUow.userRepository.save.mockResolvedValue(makeSavedUser());
      mockCreateSubmissionUseCase.execute.mockResolvedValue(undefined);
      mockCreateDocumentUseCase.execute.mockResolvedValue(makeSavedDocument());

      const differentFile: UploadedFile = {
        buffer: Buffer.from('other-content'),
        fileName: 'other.pdf',
        mimeType: 'application/pdf',
      };

      await expect(
        useCase.execute({ ...HANDICAP_DTO, caregiver: false }, [
          mockFileEntry,
          { file: differentFile, documentType: DocumentType.PROOF_OF_HANDICAP },
        ]),
      ).resolves.toBeDefined();
    });
  });

  describe('duplicate file detection', () => {
    beforeEach(() => {
      mockEmailVerificationUseCase.validateToken.mockReturnValue(undefined);
      mockRoleRepository.findById.mockResolvedValue(makeRole('HANDICAP_USER'));
      mockUserRepository.findByEmail.mockResolvedValue(null);
    });

    it('should throw BadRequestException when duplicate files are submitted', async () => {
      await expect(
        useCase.execute(HANDICAP_DTO, [mockFileEntry, mockFileEntry]),
      ).rejects.toThrow(
        new BadRequestException('Duplicate files are not allowed'),
      );
    });
  });

  describe('successful registration', () => {
    beforeEach(() => {
      mockEmailVerificationUseCase.validateToken.mockReturnValue(undefined);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUow.begin.mockResolvedValue(undefined);
      mockUow.commit.mockResolvedValue(undefined);
      mockUow.userRepository.save.mockResolvedValue(makeSavedUser());
    });

    it('should register a REGULAR user without submission or documents', async () => {
      mockRoleRepository.findById.mockResolvedValue(makeRole('REGULAR'));

      const result = await useCase.execute(BASE_DTO);

      expect(mockUow.begin).toHaveBeenCalledTimes(1);
      expect(mockUow.commit).toHaveBeenCalledTimes(1);
      expect(mockCreateSubmissionUseCase.execute).not.toHaveBeenCalled();
      expect(mockCreateDocumentUseCase.execute).not.toHaveBeenCalled();
      expect(result).toEqual(makeSavedUser());
    });

    it('should register a HANDICAP_USER, create a submission and save documents', async () => {
      mockRoleRepository.findById.mockResolvedValue(makeRole('HANDICAP_USER'));
      mockCreateSubmissionUseCase.execute.mockResolvedValue(undefined);
      mockCreateDocumentUseCase.execute.mockResolvedValue(makeSavedDocument());

      const differentFile: UploadedFile = {
        buffer: Buffer.from('other-content'),
        fileName: 'other.pdf',
        mimeType: 'application/pdf',
      };

      await useCase.execute(HANDICAP_DTO, [
        mockFileEntry,
        { file: differentFile, documentType: DocumentType.PROOF_OF_HANDICAP },
      ]);

      expect(mockCreateSubmissionUseCase.execute).toHaveBeenCalledWith(
        {
          title: 'Registration Submission',
          submissionType: SubmissionType.REGISTRATION_HANDICAP_USER,
        },
        MOCK_UUID,
        expect.any(String),
        mockUow,
      );
      expect(mockCreateDocumentUseCase.execute).toHaveBeenCalledTimes(2);
      expect(mockUow.commit).toHaveBeenCalledTimes(1);
    });
  });

  describe('rollback on failure', () => {
    beforeEach(() => {
      mockEmailVerificationUseCase.validateToken.mockReturnValue(undefined);
      mockRoleRepository.findById.mockResolvedValue(makeRole('HANDICAP_USER'));
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUow.begin.mockResolvedValue(undefined);
      mockUow.rollback.mockResolvedValue(undefined);
      mockUow.userRepository.save.mockResolvedValue(makeSavedUser());
      mockCreateSubmissionUseCase.execute.mockResolvedValue(undefined);
      mockStorageService.deleteFile.mockResolvedValue(undefined);
    });

    it('should rollback and delete uploaded files (by fileName) when commit fails', async () => {
      mockCreateDocumentUseCase.execute.mockResolvedValue(
        makeSavedDocument(MOCK_FILE_NAME),
      );
      mockUow.commit.mockRejectedValue(new Error('DB commit failed'));

      await expect(
        useCase.execute(HANDICAP_DTO, [mockFileEntry]),
      ).rejects.toThrow('DB commit failed');

      expect(mockUow.rollback).toHaveBeenCalledTimes(1);
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        MOCK_FILE_NAME,
      );
    });

    it('should not call deleteFile when no documents were saved before the failure', async () => {
      mockUow.userRepository.save.mockRejectedValue(new Error('DB error'));

      await expect(
        useCase.execute(HANDICAP_DTO, [mockFileEntry]),
      ).rejects.toThrow('DB error');

      expect(mockUow.rollback).toHaveBeenCalledTimes(1);
      expect(mockStorageService.deleteFile).not.toHaveBeenCalled();
    });

    it('should still delete uploaded files even when rollback itself throws', async () => {
      mockCreateDocumentUseCase.execute.mockResolvedValue(
        makeSavedDocument(MOCK_FILE_NAME),
      );
      mockUow.commit.mockRejectedValue(new Error('DB commit failed'));
      mockUow.rollback.mockRejectedValue(new Error('DB rollback failed'));

      await expect(
        useCase.execute(HANDICAP_DTO, [mockFileEntry]),
      ).rejects.toThrow('DB commit failed');

      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        MOCK_FILE_NAME,
      );
    });
  });
});
