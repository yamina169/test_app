import {
  HandicapProfile,
  InstitutionProfile,
  User,
} from '@domain/entities/user.entity';
import { OccupationStatus } from '@common/enums/user.enum';
import { UserEntity } from '../database/entities/user.entity';
import { RoleEntity } from '../database/entities/role.entity';

type ProfileStatus = 'none' | 'full' | 'partial';

export class UserMapper {
  // ─── Private constants ────────────────────────────────────────────────────

  /** All must be non-null to build a valid HandicapProfile */
  private static readonly HANDICAP_REQUIRED = [
    'dateOfBirth',
    'governorate',
    'city',
    'handicapType',
    'occupationStatus',
    'handicapCardId',
  ] as const satisfies ReadonlyArray<keyof UserEntity>;

  /** All must be non-null to build a valid InstitutionProfile */
  private static readonly INSTITUTION_REQUIRED = [
    'institutionName',
    'institutionPhone',
    'institutionEmail',
    'institutionGovernorate',
    'institutionCity',
  ] as const satisfies ReadonlyArray<keyof UserEntity>;

  /** @throws if role not loaded or if any profile has partial data */
  static toDomain(entity: UserEntity): User {
    if (!entity.role) throw new Error('UserMapper: role must be eager-loaded');

    const handicapStatus = UserMapper.getProfileStatus(
      entity,
      UserMapper.HANDICAP_REQUIRED,
    );
    const institutionStatus = UserMapper.getProfileStatus(
      entity,
      UserMapper.INSTITUTION_REQUIRED,
    );
    UserMapper.assertNoPartialProfile(handicapStatus, 'HandicapProfile');
    UserMapper.assertNoPartialProfile(institutionStatus, 'InstitutionProfile');
    return new User(
      entity.id,
      entity.fullName,
      entity.email,
      entity.phone,
      entity.password,
      entity.status,
      entity.role.id,
      entity.createdAt,
      entity.updatedAt,
      handicapStatus === 'full' ? UserMapper.buildHandicap(entity) : null,
      institutionStatus === 'full' ? UserMapper.buildInstitution(entity) : null,
    );
  }

  /** Flattens User aggregate into a single-table UserEntity */
  static toOrm(domain: User): UserEntity {
    const entity = new UserEntity();
    const hp = domain.handicapProfile;
    const ip = domain.institutionProfile;

    entity.id = domain.id;
    entity.fullName = domain.fullName;
    entity.email = domain.email;
    entity.phone = domain.phone;
    entity.password = domain.password;
    entity.status = domain.status;
    entity.role = { id: domain.roleId } as RoleEntity;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;

    // undefined when no profile — TypeORM omits null columns on save
    entity.dateOfBirth = hp?.dateOfBirth;
    entity.governorate = hp?.governorate;
    entity.city = hp?.city;
    entity.handicapType = hp?.handicapType;
    entity.requiredAccommodation = hp?.requiredAccommodation;
    entity.occupationStatus = hp?.occupationStatus;
    entity.caregiver = hp?.caregiver;
    entity.handicapCardId = hp?.handicapCardId;

    entity.institutionName = ip?.institutionName;
    entity.institutionPhone = ip?.institutionPhone;
    entity.institutionEmail = ip?.institutionEmail;
    entity.institutionGovernorate = ip?.institutionGovernorate;
    entity.institutionCity = ip?.institutionCity;
    entity.website = ip?.website;
    entity.typeOfServices = ip?.typeOfServices;
    entity.accessible = ip?.accessible;
    entity.specificEquipment = ip?.specificEquipment;

    return entity;
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /** Counts present required keys → 'none' | 'full' | 'partial' */
  private static getProfileStatus(
    entity: UserEntity,
    keys: ReadonlyArray<keyof UserEntity>,
  ): ProfileStatus {
    const n = keys.filter((k) => entity[k] != null).length;
    if (n === 0) return 'none';
    if (n === keys.length) return 'full';
    return 'partial';
  }

  /** Partial profile = corrupted data — fail fast */
  private static assertNoPartialProfile(
    status: ProfileStatus,
    name: string,
  ): void {
    if (status === 'partial')
      throw new Error(
        `UserMapper: incomplete ${name} — all required fields must be populated or none`,
      );
  }

  /** Safe to use ! — only called when status is 'full' */
  private static buildHandicap(e: UserEntity): HandicapProfile {
    return new HandicapProfile(
      e.dateOfBirth!,
      e.governorate!,
      e.city!,
      e.handicapType!,
      e.requiredAccommodation ?? [],
      e.occupationStatus as OccupationStatus,
      e.caregiver ?? false,
      e.handicapCardId!,
    );
  }

  private static buildInstitution(e: UserEntity): InstitutionProfile {
    return new InstitutionProfile(
      e.institutionName!,
      e.institutionPhone!,
      e.institutionEmail!,
      e.institutionGovernorate!,
      e.institutionCity!,
      e.website ?? '',
      e.typeOfServices ?? [],
      e.accessible ?? false,
      e.specificEquipment ?? [],
    );
  }
}
