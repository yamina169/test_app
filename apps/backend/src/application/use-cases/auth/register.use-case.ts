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
import { AccountStatus } from '@common/enums/user.enum';
import { SubmissionType } from '@common/enums/submission.enum';
import { DocumentType } from '@common/enums/document.enum';
import { CreateSubmissionUseCase } from '../submission/create-submission.use-case';
import { CreateDocumentUseCase } from '../document/create-document.use-case';

type FileEntry = { file: UploadedFile; documentType: DocumentType };

const SUBMISSION_TYPE_MAP: Record<string, SubmissionType> = {
  HANDICAP_USER: SubmissionType.REGISTRATION_HANDICAP_USER,
  INSTITUTION_ADMIN: SubmissionType.REGISTRATION_INSTITUTION,
};

/**
 * Registers a new user, optionally creating a submission with supporting documents.
 * All DB writes are wrapped in a single transaction; MinIO uploads are rolled back on failure.
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
  ) {}

  async execute(dto: RegisterUserDto, files: FileEntry[] = []): Promise<User> {
    const now = new Date();

    // Run pre-checks in parallel before opening a transaction to avoid unnecessary DB locks.
    const [role, existing] = await Promise.all([
      this.roleRepository.findById(dto.roleId),
      this.userRepository.findByEmail(dto.email),
    ]);

    if (!role) throw new NotFoundException('Role not found');
    if (existing) throw new ConflictException('Email already in use');

    const submissionType = SUBMISSION_TYPE_MAP[role.type] ?? null;

    if (submissionType && files.length === 0)
      throw new BadRequestException('At least one document is required');

    // Reject duplicate files early to avoid partial uploads inside the transaction.
    const hashes = files.map(({ file }) =>
      createHash('sha256').update(file.buffer).digest('hex'),
    );
    if (hashes.length !== new Set(hashes).size)
      throw new BadRequestException('Duplicate files are not allowed');
    const uploadedFileUrls: string[] = [];
    await this.uow.begin();

    try {
      const user = new User(
        uuid(),
        dto.fullName,
        dto.email,
        dto.phone,
        await bcrypt.hash(dto.password, 10),
        AccountStatus.PENDING,
        role.id,
        now,
        now,
        role.type === 'HANDICAP_USER' ? this.buildHandicapProfile(dto) : null,
        role.type === 'INSTITUTION_ADMIN'
          ? this.buildInstitutionProfile(dto)
          : null,
      );
      const savedUser = await this.uow.userRepository.save(user);

      if (submissionType) {
        // Pre-generate the submission ID so documents can reference it before they are persisted.
        const submissionId = uuid();

        await this.createSubmissionUseCase.execute(
          { title: 'Registration Submission', submissionType },
          savedUser.id,
          submissionId,
          this.uow,
        );

        for (const { file, documentType } of files) {
          const doc = await this.createDocumentUseCase.execute(
            file,
            documentType,
            submissionId,
            this.uow,
          );
          uploadedFileUrls.push(doc.fileUrl);
        }
      }

      await this.uow.commit();
      return savedUser;
    } catch (err) {
      await this.uow.rollback();
      await this.rollbackStorage(uploadedFileUrls);
      throw err;
    }
  }

  private async rollbackStorage(fileUrls: string[]): Promise<void> {
    if (!fileUrls.length) return;
    this.logger.warn(`Rolling back ${fileUrls.length} MinIO upload(s)`);
    await Promise.allSettled(
      fileUrls.map((url) =>
        this.storageService
          .deleteFile(url)
          .catch((e) => this.logger.error(`Rollback failed for "${url}"`, e)),
      ),
    );
  }

  /** Validates and builds the handicap profile from the DTO. */
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
      caregiver === undefined ||
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

  /** Validates and builds the institution profile from the DTO. */
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
      accessible === undefined ||
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
