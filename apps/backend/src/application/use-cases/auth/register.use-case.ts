import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { createHash } from 'crypto';

import type { IUnitOfWork } from '@domain/interfaces/unit-of-work.interface';
import type { IUserRepository } from '@domain/interfaces/user.repository.interface';
import type { IRoleRepository } from '@domain/interfaces/role.repository.interface';
import type { IStorageService } from '@domain/interfaces/storage.service.interface';
import type { UploadedFile } from '@domain/interfaces/uploaded-file.interface';
import { RegisterUserDto } from '@application/dto/auth/register.dto';
import {
  HandicapProfile,
  InstitutionProfile,
  User,
} from '@domain/entities/user.entity';
import { AccountStatus } from '@domain/enums/user.enum';
import { SubmissionType } from '@domain/enums/submission.enum';
import { DocumentType } from '@domain/enums/document.enum';
import { CreateSubmissionUseCase } from '../submission/create-submission.use-case';
import { CreateDocumentUseCase } from '../document/create-document.use-case';
import { EmailVerificationUseCase } from '../mail/email-verification/email-verification.use-case';

type FileEntry = { file: UploadedFile; documentType: DocumentType };

const SUBMISSION_TYPE_MAP: Partial<Record<string, SubmissionType>> = {
  HANDICAP_USER: SubmissionType.REGISTRATION_HANDICAP_USER,
  INSTITUTION_ADMIN: SubmissionType.REGISTRATION_INSTITUTION,
};

/**
 * Registers a new user.
 *
 * Flow:
 * 1. Validate email verification token — before any I/O.
 * 2. Pre-checks in parallel (role exists, email not taken).
 * 3. Build role-specific profiles — validates required fields early.
 * 4. Reject duplicate files by content hash.
 * 5. Hash password — outside the transaction to avoid holding a connection during CPU work.
 * 6. Open transaction: persist user, submission, documents.
 * 7. On failure: DB rollback (non-throwing) then delete any uploaded files.
 */
@Injectable()
export class RegisterUserUseCase {
  private readonly logger = new Logger(RegisterUserUseCase.name);

  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository') private readonly roleRepository: IRoleRepository,
    @Inject('IStorageService') private readonly storageService: IStorageService,
    private readonly createSubmissionUseCase: CreateSubmissionUseCase,
    private readonly createDocumentUseCase: CreateDocumentUseCase,
    private readonly emailVerificationUseCase: EmailVerificationUseCase,
  ) {}

  async execute(dto: RegisterUserDto, files: FileEntry[] = []): Promise<User> {
    const now = new Date();

    this.emailVerificationUseCase.validateToken(
      dto.emailVerificationToken,
      dto.email,
    );

    const [role, existing] = await Promise.all([
      this.roleRepository.findById(dto.roleId),
      this.userRepository.findByEmail(dto.email),
    ]);

    if (!role) throw new NotFoundException('Role not found');
    if (existing) throw new ConflictException('Email already in use');

    const submissionType = SUBMISSION_TYPE_MAP[role.type] ?? null;

    if (submissionType && files.length === 0)
      throw new BadRequestException('At least one document is required');

    const handicapProfile =
      role.type === 'HANDICAP_USER' ? this.buildHandicapProfile(dto) : null;
    const institutionProfile =
      role.type === 'INSTITUTION_ADMIN'
        ? this.buildInstitutionProfile(dto)
        : null;

    const hashes = files.map(({ file }) =>
      createHash('sha256').update(file.buffer).digest('hex'),
    );
    if (hashes.length !== new Set(hashes).size)
      throw new BadRequestException('Duplicate files are not allowed');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const uploadedFileNames: string[] = [];
    await this.uow.begin();

    try {
      const savedUser = await this.uow.userRepository.save(
        new User(
          uuid(),
          dto.fullName,
          dto.email,
          dto.phone,
          hashedPassword,
          AccountStatus.PENDING,
          role.id,
          now,
          now,
          handicapProfile,
          institutionProfile,
        ),
      );

      if (submissionType) {
        const submissionId = uuid();

        await this.createSubmissionUseCase.execute(
          { title: 'Registration Submission', submissionType },
          savedUser.id,
          submissionId,
          this.uow,
        );

        await Promise.all(
          files.map(({ file, documentType }) =>
            this.createDocumentUseCase
              .execute(file, documentType, submissionId, this.uow)
              .then((doc) => uploadedFileNames.push(doc.fileName)),
          ),
        );
      }

      await this.uow.commit();
      return savedUser;
    } catch (err) {
      await this.uow
        .rollback()
        .catch((e) => this.logger.error('DB rollback failed', e));
      await this.rollbackStorage(uploadedFileNames);
      throw err;
    }
  }

  private async rollbackStorage(fileNames: string[]): Promise<void> {
    if (!fileNames.length) return;
    this.logger.warn(`Rolling back ${fileNames.length} storage upload(s)`);
    await Promise.allSettled(
      fileNames.map((name) =>
        this.storageService
          .deleteFile(name)
          .catch((e) => this.logger.error(`Rollback failed for "${name}"`, e)),
      ),
    );
  }

  private buildHandicapProfile(dto: RegisterUserDto): HandicapProfile {
    const {
      dateOfBirth,
      governorate,
      city,
      handicapType,
      requiredAccommodation,
      occupationStatus,
      caregiver,
      handicapCardId,
    } = dto;

    if (
      !dateOfBirth ||
      !governorate ||
      !city ||
      !handicapType ||
      !requiredAccommodation ||
      !occupationStatus ||
      caregiver == null ||
      !handicapCardId
    )
      throw new BadRequestException('Missing handicap profile fields');

    return new HandicapProfile(
      dateOfBirth,
      governorate,
      city,
      handicapType,
      requiredAccommodation,
      occupationStatus,
      caregiver,
      handicapCardId,
    );
  }

  private buildInstitutionProfile(dto: RegisterUserDto): InstitutionProfile {
    const {
      institutionName,
      institutionPhone,
      institutionEmail,
      institutionGovernorate,
      institutionCity,
      website,
      typeOfServices,
      accessible,
      specificEquipment,
    } = dto;

    if (
      !institutionName ||
      !institutionPhone ||
      !institutionEmail ||
      !institutionGovernorate ||
      !institutionCity ||
      !website ||
      !typeOfServices ||
      accessible == null ||
      !specificEquipment
    )
      throw new BadRequestException('Missing institution profile fields');

    return new InstitutionProfile(
      institutionName,
      institutionPhone,
      institutionEmail,
      institutionGovernorate,
      institutionCity,
      website,
      typeOfServices,
      accessible,
      specificEquipment,
    );
  }
}
