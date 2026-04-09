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
import type {
  UploadedFile,
  FileEntry,
} from '@domain/interfaces/uploaded-file.interface';

import { CreateDocumentUseCase } from '../../document/create-document.use-case';
import { EmailVerificationUseCase } from '../../mail/email-verification/email-verification.use-case';
import { CreateSubmissionUseCase } from '../../submission/create-submission.use-case';
import { RegisterUserUseCase } from './register.use-case';

const MOCK_UUID = '00000000-0000-0000-0000-000000000001';
const MOCK_EMAIL = 'user@example.com';
const MOCK_OTP = '123456';
const MOCK_FILE_NAME = 'sub-id/abc123.pdf';

const BASE_DTO: RegisterUserDto = {
  fullName: 'Test User',
  email: MOCK_EMAIL,
  phone: '+21600000000',
  password: 'P@ssw0rd!',
  roleId: 1,
  otpCode: MOCK_OTP,
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

const INSTITUTION_DTO: RegisterUserDto = {
  ...BASE_DTO,
  institutionName: 'Test Institution',
  institutionPhone: '+21612345678',
  institutionEmail: 'institution@example.com',
  institutionGovernorate: 'Tunis',
  institutionCity: 'Tunis',
  website: 'https://institution.example.com',
  typeOfServices: ['rehabilitation'],
  accessible: true,
  specificEquipment: ['wheelchair ramp'],
};

const PRIMARY_FILE: UploadedFile = {
  buffer: Buffer.from('file-content-primary'),
  fileName: 'doc.pdf',
  mimeType: 'application/pdf',
};

const SECONDARY_FILE: UploadedFile = {
  buffer: Buffer.from('file-content-secondary'),
  fileName: 'other.pdf',
  mimeType: 'application/pdf',
};

const PRIMARY_FILE_ENTRY: FileEntry = {
  file: PRIMARY_FILE,
  documentType: DocumentType.PROOF_OF_HANDICAP,
};

const SECONDARY_FILE_ENTRY: FileEntry = {
  file: SECONDARY_FILE,
  documentType: DocumentType.PROOF_OF_HANDICAP,
};

function makeRole(type: string) {
  return {
    id: 1,
    type,
    getSubmissionType: () => {
      if (type === 'HANDICAP_USER')
        return SubmissionType.REGISTRATION_HANDICAP_USER;
      if (type === 'INSTITUTION_ADMIN')
        return SubmissionType.REGISTRATION_INSTITUTION;
      return null;
    },
  };
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

function createMocks() {
  return {
    uow: {
      begin: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      userRepository: {
        save: jest.fn().mockResolvedValue(makeSavedUser()),
        findByEmail: jest.fn().mockResolvedValue(null),
      },
    },
    roleRepository: {
      findById: jest.fn(),
    },
    storageService: {
      deleteFile: jest.fn().mockResolvedValue(undefined),
    },
    createSubmissionUseCase: {
      execute: jest.fn().mockResolvedValue(undefined),
    },
    createDocumentUseCase: {
      execute: jest.fn().mockResolvedValue(makeSavedDocument()),
    },
    emailVerificationUseCase: {
      verifyOtp: jest.fn().mockReturnValue(undefined),
    },
  };
}

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15').getTime());

    mocks = createMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        { provide: 'IUnitOfWork', useValue: mocks.uow },
        { provide: 'IRoleRepository', useValue: mocks.roleRepository },
        { provide: 'IStorageService', useValue: mocks.storageService },
        {
          provide: CreateSubmissionUseCase,
          useValue: mocks.createSubmissionUseCase,
        },
        {
          provide: CreateDocumentUseCase,
          useValue: mocks.createDocumentUseCase,
        },
        {
          provide: EmailVerificationUseCase,
          useValue: mocks.emailVerificationUseCase,
        },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('pre-checks', () => {
    it('should throw NotFoundException when the role does not exist', async () => {
      mocks.roleRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(BASE_DTO)).rejects.toThrow(
        new NotFoundException('Role not found'),
      );

      expect(mocks.emailVerificationUseCase.verifyOtp).not.toHaveBeenCalled();
      expect(mocks.uow.begin).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when the email is already in use', async () => {
      mocks.roleRepository.findById.mockResolvedValue(makeRole('REGULAR'));
      mocks.uow.userRepository.findByEmail.mockResolvedValue({
        id: 'existing-id',
      });

      await expect(useCase.execute(BASE_DTO)).rejects.toThrow(
        new ConflictException('Email already in use'),
      );

      expect(mocks.emailVerificationUseCase.verifyOtp).not.toHaveBeenCalled();
      expect(mocks.uow.begin).not.toHaveBeenCalled();
    });
  });

  // ─── OTP validation ──────────────────────────────────────────────────────────

  describe('OTP validation', () => {
    it('should call verifyOtp with email and otpCode after pre-checks pass', async () => {
      mocks.roleRepository.findById.mockResolvedValue(makeRole('REGULAR'));

      await useCase.execute(BASE_DTO);

      expect(mocks.emailVerificationUseCase.verifyOtp).toHaveBeenCalledWith(
        MOCK_EMAIL,
        MOCK_OTP,
      );
    });

    it('should throw if verifyOtp throws — transaction never opened', async () => {
      mocks.roleRepository.findById.mockResolvedValue(makeRole('REGULAR'));
      mocks.emailVerificationUseCase.verifyOtp.mockImplementation(() => {
        throw new BadRequestException(
          'Verification token is invalid or expired',
        );
      });

      await expect(useCase.execute(BASE_DTO)).rejects.toThrow(
        new BadRequestException('Verification token is invalid or expired'),
      );

      expect(mocks.uow.begin).not.toHaveBeenCalled();
      expect(mocks.uow.userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('profile validation', () => {
    beforeEach(() => {
      mocks.roleRepository.findById.mockResolvedValue(
        makeRole('HANDICAP_USER'),
      );
    });

    it('should throw BadRequestException when a submission role has no files', async () => {
      await expect(useCase.execute(HANDICAP_DTO, [])).rejects.toThrow(
        new BadRequestException('At least one document is required'),
      );

      expect(mocks.uow.begin).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for HANDICAP_USER with missing profile fields', async () => {
      await expect(
        useCase.execute(BASE_DTO, [PRIMARY_FILE_ENTRY]),
      ).rejects.toThrow(
        new BadRequestException('Missing handicap profile fields'),
      );

      expect(mocks.uow.begin).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for INSTITUTION_ADMIN with missing profile fields', async () => {
      mocks.roleRepository.findById.mockResolvedValue(
        makeRole('INSTITUTION_ADMIN'),
      );

      await expect(
        useCase.execute(BASE_DTO, [PRIMARY_FILE_ENTRY]),
      ).rejects.toThrow(
        new BadRequestException('Missing institution profile fields'),
      );

      expect(mocks.uow.begin).not.toHaveBeenCalled();
    });
  });

  describe('duplicate file detection', () => {
    it('should throw BadRequestException when duplicate files are submitted', async () => {
      mocks.roleRepository.findById.mockResolvedValue(
        makeRole('HANDICAP_USER'),
      );

      await expect(
        useCase.execute(HANDICAP_DTO, [PRIMARY_FILE_ENTRY, PRIMARY_FILE_ENTRY]),
      ).rejects.toThrow(
        new BadRequestException('Duplicate files are not allowed'),
      );

      expect(mocks.uow.begin).not.toHaveBeenCalled();
    });
  });

  describe('successful registration', () => {
    it('should register a REGULAR user without submission or documents', async () => {
      mocks.roleRepository.findById.mockResolvedValue(makeRole('REGULAR'));

      const result = await useCase.execute(BASE_DTO);

      expect(mocks.uow.begin).toHaveBeenCalledTimes(1);
      expect(mocks.uow.commit).toHaveBeenCalledTimes(1);
      expect(mocks.createSubmissionUseCase.execute).not.toHaveBeenCalled();
      expect(mocks.createDocumentUseCase.execute).not.toHaveBeenCalled();
      expect(result).toEqual(makeSavedUser());
    });

    it('should register a HANDICAP_USER with caregiver: false, create submission and save documents', async () => {
      mocks.roleRepository.findById.mockResolvedValue(
        makeRole('HANDICAP_USER'),
      );

      const result = await useCase.execute(
        { ...HANDICAP_DTO, caregiver: false },
        [PRIMARY_FILE_ENTRY, SECONDARY_FILE_ENTRY],
      );

      expect(mocks.uow.begin).toHaveBeenCalledTimes(1);
      expect(mocks.createSubmissionUseCase.execute).toHaveBeenCalledWith(
        {
          title: 'Registration Submission',
          submissionType: SubmissionType.REGISTRATION_HANDICAP_USER,
        },
        MOCK_UUID,
        expect.any(String),
        mocks.uow,
      );
      expect(mocks.createDocumentUseCase.execute).toHaveBeenCalledTimes(2);
      expect(mocks.uow.commit).toHaveBeenCalledTimes(1);
      expect(result).toEqual(makeSavedUser());
    });

    it('should register an INSTITUTION_ADMIN, create submission and save documents', async () => {
      mocks.roleRepository.findById.mockResolvedValue(
        makeRole('INSTITUTION_ADMIN'),
      );

      const result = await useCase.execute(INSTITUTION_DTO, [
        PRIMARY_FILE_ENTRY,
      ]);

      expect(mocks.createSubmissionUseCase.execute).toHaveBeenCalledWith(
        {
          title: 'Registration Submission',
          submissionType: SubmissionType.REGISTRATION_INSTITUTION,
        },
        MOCK_UUID,
        expect.any(String),
        mocks.uow,
      );
      expect(mocks.createDocumentUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mocks.uow.commit).toHaveBeenCalledTimes(1);
      expect(result).toEqual(makeSavedUser());
    });
  });

  describe('rollback on failure', () => {
    beforeEach(() => {
      mocks.roleRepository.findById.mockResolvedValue(
        makeRole('HANDICAP_USER'),
      );
      mocks.createSubmissionUseCase.execute.mockResolvedValue(undefined);
    });

    it('should rollback DB and delete uploaded files when commit fails', async () => {
      mocks.createDocumentUseCase.execute.mockResolvedValue(
        makeSavedDocument(MOCK_FILE_NAME),
      );
      mocks.uow.commit.mockRejectedValue(new Error('DB commit failed'));

      await expect(
        useCase.execute(HANDICAP_DTO, [PRIMARY_FILE_ENTRY]),
      ).rejects.toThrow('DB commit failed');

      expect(mocks.uow.rollback).toHaveBeenCalledTimes(1);
      expect(mocks.storageService.deleteFile).toHaveBeenCalledWith(
        MOCK_FILE_NAME,
      );
    });

    it('should not call deleteFile when no documents were saved before the failure', async () => {
      mocks.uow.userRepository.save.mockRejectedValue(new Error('DB error'));

      await expect(
        useCase.execute(HANDICAP_DTO, [PRIMARY_FILE_ENTRY]),
      ).rejects.toThrow('DB error');

      expect(mocks.uow.rollback).toHaveBeenCalledTimes(1);
      expect(mocks.storageService.deleteFile).not.toHaveBeenCalled();
    });

    it('should still delete uploaded files even when rollback itself throws', async () => {
      mocks.createDocumentUseCase.execute.mockResolvedValue(
        makeSavedDocument(MOCK_FILE_NAME),
      );
      mocks.uow.commit.mockRejectedValue(new Error('DB commit failed'));
      mocks.uow.rollback.mockRejectedValue(new Error('DB rollback failed'));

      await expect(
        useCase.execute(HANDICAP_DTO, [PRIMARY_FILE_ENTRY]),
      ).rejects.toThrow('DB commit failed');

      expect(mocks.storageService.deleteFile).toHaveBeenCalledWith(
        MOCK_FILE_NAME,
      );
    });

    it('should rollback multiple uploaded files on failure', async () => {
      const FILE_A = 'sub-id/file-a.pdf';
      const FILE_B = 'sub-id/file-b.pdf';

      mocks.createDocumentUseCase.execute
        .mockResolvedValueOnce(makeSavedDocument(FILE_A))
        .mockResolvedValueOnce(makeSavedDocument(FILE_B));
      mocks.uow.commit.mockRejectedValue(new Error('DB commit failed'));

      await expect(
        useCase.execute(HANDICAP_DTO, [
          PRIMARY_FILE_ENTRY,
          SECONDARY_FILE_ENTRY,
        ]),
      ).rejects.toThrow('DB commit failed');

      expect(mocks.storageService.deleteFile).toHaveBeenCalledWith(FILE_A);
      expect(mocks.storageService.deleteFile).toHaveBeenCalledWith(FILE_B);
      expect(mocks.storageService.deleteFile).toHaveBeenCalledTimes(2);
    });
  });
});
