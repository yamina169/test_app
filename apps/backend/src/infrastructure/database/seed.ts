import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RoleEntity } from './entities/role.entity';
import { UserEntity } from './entities/user.entity';
import { SubmissionEntity } from './entities/submission.entity';
import { DocumentEntity } from './entities/document.entity';
import { AccountStatus, OccupationStatus } from '@domain/enums/user.enum';
import {
  SubmissionStatus,
  SubmissionType,
} from '@domain/enums/submission.enum';
import { DocumentType } from '@domain/enums/document.enum';
import { AppDataSource } from '@infrastructure/database/data-source';

const logger = new Logger('Seed');

const ROLES = ['SUPER_ADMIN', 'HANDICAP_USER', 'INSTITUTION_ADMIN'] as const;

const USERS = [
  {
    fullName: 'Ali Ben Ahmed',
    email: 'ali@example.tn',
    phone: '+21612345678',
    password: 'Password123!',
    status: AccountStatus.ACTIVE,
    dateOfBirth: new Date('1995-05-12'),
    governorate: 'Tunis',
    city: 'Carthage',
    handicapType: 'Visual',
    requiredAccommodation: ['Braille', 'Screen Reader'],
    occupationStatus: OccupationStatus.STUDENT,
    caregiver: false,
    handicapCardId: 'HC-2024-001',
    roleType: 'HANDICAP_USER' as const,
  },
  {
    fullName: 'Sarra Mhiri',
    email: 'sarra@example.tn',
    phone: '+21698765432',
    password: 'Password123!',
    status: AccountStatus.ACTIVE,
    dateOfBirth: new Date('1990-03-22'),
    governorate: 'Sfax',
    city: 'Sfax',
    handicapType: 'Mobility',
    requiredAccommodation: ['Wheelchair Access'],
    occupationStatus: OccupationStatus.UNEMPLOYED,
    caregiver: true,
    handicapCardId: 'HC-2024-002',
    roleType: 'HANDICAP_USER' as const,
  },
  {
    fullName: 'Khaled Trabelsi',
    email: 'khaled.admin@example.tn',
    phone: '+21655555555',
    password: 'AdminPass123!',
    status: AccountStatus.ACTIVE,
    roleType: 'INSTITUTION_ADMIN' as const,
    institutionName: 'Centre Amal',
    institutionPhone: '+21644444444',
    institutionEmail: 'contact@centre-amel.tn',
    institutionGovernorate: 'Tunis',
    institutionCity: 'La Marsa',
    website: 'https://centre-amel.tn',
    typeOfServices: ['Therapy', 'Training'],
    accessible: true,
    specificEquipment: ['Braille Materials', 'Wheelchair Ramp'],
  },
];

const SUBMISSIONS = [
  {
    title: 'Handicap Registration',
    description: 'Registration request for handicapped user',
    status: SubmissionStatus.PENDING,
    submissionType: SubmissionType.REGISTRATION_HANDICAP_USER,
    userEmail: 'ali@example.tn',
  },
  {
    title: 'Handicap ID Card Request',
    description: 'ID card request for person with disability',
    status: SubmissionStatus.PENDING,
    submissionType: SubmissionType.HANDICAP_ID_CARD,
    userEmail: 'sarra@example.tn',
  },
];
const DOCUMENTS = [
  {
    fileName: 'handicap_proof.pdf',
    fileUrl: 'https://minio.example.tn/uploads/handicap_proof.pdf',
    documentType: DocumentType.PROOF_OF_HANDICAP,
    submissionTitle: 'Handicap Registration',
  },
  {
    fileName: 'id_card.pdf',
    fileUrl: 'https://minio.example.tn/uploads/id_card.pdf',
    documentType: DocumentType.IDENTITY_DOCUMENT,
    submissionTitle: 'Handicap ID Card Request',
  },
];

/**
 * Populates the database with initial test data.
 * Development use only.
 */
async function seed() {
  const dataSource: DataSource = AppDataSource;

  if ((process.env.NODE_ENV ?? 'development') === 'production') {
    throw new Error('Seeding is disabled in production');
  }

  await dataSource.initialize();
  logger.log('Database connection established');

  try {
    const roleRepo = dataSource.getRepository(RoleEntity);
    const userRepo = dataSource.getRepository(UserEntity);
    const submissionRepo = dataSource.getRepository(SubmissionEntity);
    const documentRepo = dataSource.getRepository(DocumentEntity);

    for (const type of ROLES) {
      const existing = await roleRepo.findOneBy({ type });
      if (!existing) {
        await roleRepo.save(roleRepo.create({ type }));
        logger.log(`Role created: ${type}`);
      } else {
        logger.log(`Role exists, skipping: ${type}`);
      }
    }

    const rolesMap = Object.fromEntries(
      (await roleRepo.find()).map((r) => [r.type, r]),
    );

    for (const u of USERS) {
      const existing = await userRepo.findOneBy({ email: u.email });
      if (!existing) {
        const role = rolesMap[u.roleType];
        if (!role) throw new Error(`Role not found: ${u.roleType}`);

        await userRepo.save(
          userRepo.create({
            ...u,
            password: await bcrypt.hash(u.password, 10),
            role,
          }),
        );
        logger.log(`User created: ${u.email}`);
      } else {
        logger.log(`User exists, skipping: ${u.email}`);
      }
    }

    const usersMap = Object.fromEntries(
      (await userRepo.find({ relations: ['role'] })).map((u) => [u.email, u]),
    );

    for (const s of SUBMISSIONS) {
      const existing = await submissionRepo.findOneBy({ title: s.title });
      if (!existing) {
        const user = usersMap[s.userEmail];
        if (!user) throw new Error(`User not found: ${s.userEmail}`);

        await submissionRepo.save(submissionRepo.create({ ...s, user }));
        logger.log(`Submission created: ${s.title}`);
      } else {
        logger.log(`Submission exists, skipping: ${s.title}`);
      }
    }

    const submissionsMap = Object.fromEntries(
      (await submissionRepo.find({ relations: ['user'] })).map((s) => [
        s.title,
        s,
      ]),
    );

    for (const d of DOCUMENTS) {
      const existing = await documentRepo.findOneBy({ fileName: d.fileName });
      if (!existing) {
        const submission = submissionsMap[d.submissionTitle] ?? null;

        await documentRepo.save(documentRepo.create({ ...d, submission }));
        logger.log(`Document created: ${d.fileName}`);
      } else {
        logger.log(`Document exists, skipping: ${d.fileName}`);
      }
    }

    logger.log('Seed completed successfully');
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

seed().catch((err: unknown) => {
  const message = err instanceof Error ? err.stack : String(err);
  logger.error('Seed failed', message);
  process.exit(1);
});
