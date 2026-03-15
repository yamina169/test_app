import {
  HandicapProfile,
  InstitutionProfile,
  User,
} from '@domain/entities/user.entity';
import { OccupationStatus } from '@common/enums/user.enum';
import { UserEntity } from '../database/entities/user.entity';
import { RoleEntity } from '../database/entities/role.entity';

/** Maps between the UserEntity (ORM) and the User domain model.*/
export class UserMapper {
  static toDomain(entity: UserEntity): User {
    if (!entity.role) {
      throw new Error('UserMapper: role must be loaded');
    }

    // Detect handicap profile by checking if any of its fields are populated.
    const hasHandicapProfile =
      entity.dateOfBirth != null ||
      entity.governorate != null ||
      entity.city != null ||
      entity.handicapType != null ||
      entity.requiredAccommodation != null ||
      entity.occupationStatus != null ||
      entity.caregiver != null ||
      entity.handicapCardId != null;
    const handicapProfile: HandicapProfile | null = hasHandicapProfile
      ? new HandicapProfile(
          entity.dateOfBirth as Date,
          entity.governorate as string,
          entity.city as string,
          entity.handicapType as string,
          entity.requiredAccommodation ?? [],
          entity.occupationStatus as OccupationStatus,
          entity.caregiver ?? false,
          entity.handicapCardId as string,
        )
      : null;

    // Detect institution profile by checking if any of its fields are populated.
    const hasInstitutionProfile =
      entity.institutionName != null ||
      entity.institutionPhone != null ||
      entity.institutionEmail != null ||
      entity.institutionGovernorate != null ||
      entity.institutionCity != null ||
      entity.website != null ||
      entity.typeOfServices != null ||
      entity.accessible != null ||
      entity.specificEquipment != null;

    const institutionProfile: InstitutionProfile | null = hasInstitutionProfile
      ? new InstitutionProfile(
          entity.institutionName as string,
          entity.institutionPhone as string,
          entity.institutionEmail as string,
          entity.institutionGovernorate as string,
          entity.institutionCity as string,
          entity.website as string,
          entity.typeOfServices ?? [],
          entity.accessible ?? false,
          entity.specificEquipment ?? [],
        )
      : null;

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
      handicapProfile,
      institutionProfile,
    );
  }

  static toOrm(domain: User): UserEntity {
    const entity = new UserEntity();

    entity.id = domain.id;
    entity.fullName = domain.fullName;
    entity.email = domain.email;
    entity.phone = domain.phone;
    entity.password = domain.password;
    entity.status = domain.status;
    entity.role = { id: domain.roleId } as RoleEntity;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;

    // Handicap profile
    entity.handicapCardId = domain.handicapProfile?.handicapCardId ?? undefined;
    entity.dateOfBirth = domain.handicapProfile?.dateOfBirth ?? undefined;
    entity.governorate = domain.handicapProfile?.governorate ?? undefined;
    entity.city = domain.handicapProfile?.city ?? undefined;
    entity.handicapType = domain.handicapProfile?.handicapType ?? undefined;
    entity.requiredAccommodation =
      domain.handicapProfile?.requiredAccommodation ?? undefined;
    entity.occupationStatus =
      domain.handicapProfile?.occupationStatus ?? undefined;
    entity.caregiver = domain.handicapProfile?.caregiver ?? undefined;

    // Institution profile
    entity.institutionName =
      domain.institutionProfile?.institutionName ?? undefined;
    entity.institutionPhone =
      domain.institutionProfile?.institutionPhone ?? undefined;
    entity.institutionEmail =
      domain.institutionProfile?.institutionEmail ?? undefined;
    entity.institutionGovernorate =
      domain.institutionProfile?.institutionGovernorate ?? undefined;
    entity.institutionCity =
      domain.institutionProfile?.institutionCity ?? undefined;
    entity.website = domain.institutionProfile?.website ?? undefined;
    entity.typeOfServices =
      domain.institutionProfile?.typeOfServices ?? undefined;
    entity.accessible = domain.institutionProfile?.accessible ?? undefined;
    entity.specificEquipment =
      domain.institutionProfile?.specificEquipment ?? undefined;

    return entity;
  }
}
