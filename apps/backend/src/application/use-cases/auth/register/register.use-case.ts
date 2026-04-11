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
import type { IRoleRepository } from '@domain/interfaces/role.repository.interface';
import type { IStorageService } from '@domain/interfaces/storage.service.interface';
import type { FileEntry } from '@domain/interfaces/uploaded-file.interface';
import { RegisterUserDto } from '@application/dto/auth/register.dto';
import {
  HandicapProfile,
  InstitutionProfile,
  User,
} from '@domain/entities/user.entity';
import { AccountStatus } from '@domain/enums/user.enum';
import { CreateSubmissionUseCase } from '../../submission/create-submission.use-case';
import { CreateDocumentUseCase } from '../../document/create-document.use-case';
import { EmailVerificationUseCase } from '../../mail/email-verification/email-verification.use-case';

/**
 * Registers a new user.
 *
 * Flow:
 * 1. Pre-check role and email.
 * 2. Verify OTP.
 * 3. Build role-specific profiles.
 * 4. Reject duplicate files.
 * 5. Hash password (outside transaction).
 * 6. Persist user, submission, documents in transaction.
 * 7. On failure: rollback DB and uploaded files.
 */
@Injectable()
export class RegisterUserUseCase {
  private readonly logger = new Logger(RegisterUserUseCase.name);

  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    @Inject('IRoleRepository') private readonly roleRepository: IRoleRepository,
    @Inject('IStorageService') private readonly storageService: IStorageService,
    private readonly createSubmissionUseCase: CreateSubmissionUseCase,
    private readonly createDocumentUseCase: CreateDocumentUseCase,
    private readonly emailVerificationUseCase: EmailVerificationUseCase,
  ) {}

  async execute(dto: RegisterUserDto, files: FileEntry[] = []): Promise<User> {
    const now = new Date();

    const [role, existing] = await Promise.all([
      this.roleRepository.findById(dto.roleId),
      this.uow.userRepository.findByEmail(dto.email),
    ]);

    if (!role) throw new NotFoundException('Role not found');
    if (existing) throw new ConflictException('Email already in use');

    this.emailVerificationUseCase.verifyOtp(dto.email, dto.otpCode);

    const submissionType = role.getSubmissionType();

    if (submissionType && files.length === 0)
      throw new BadRequestException('At least one document is required');

    const handicapProfile =
      role.type === 'HANDICAP_USER' ? HandicapProfile.create(dto) : null;

    const institutionProfile =
      role.type === 'INSTITUTION_ADMIN' ? InstitutionProfile.create(dto) : null;

    if (role.type === 'HANDICAP_USER' && handicapProfile === null)
      throw new BadRequestException('Missing handicap profile fields');

    if (role.type === 'INSTITUTION_ADMIN' && institutionProfile === null)
      throw new BadRequestException('Missing institution profile fields');

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
          null,
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
}
