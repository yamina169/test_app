import {
  HandicapProfile,
  InstitutionProfile,
  User,
} from '@domain/entities/user.entity';
import { UserEntity } from '../database/entities/user.entity';
import { RoleEntity } from '../database/entities/role.entity';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    if (!entity.role) {
      throw new Error('UserMapper: role must be loaded');
    }

    let handicapProfile: HandicapProfile | null = null;
    if (
      entity.dateOfBirth != null &&
      entity.governorate != null &&
      entity.city != null &&
      entity.handicapType != null &&
      entity.occupationStatus != null
    ) {
      handicapProfile = new HandicapProfile(
        entity.dateOfBirth,
        entity.governorate,
        entity.city,
        entity.handicapType,
        entity.requiredAccommodation ?? [],
        entity.occupationStatus,
        entity.caregiver ?? false,
        entity.handicapCardId ?? '',
      );
    }

    let institutionProfile: InstitutionProfile | null = null;
    if (
      entity.institutionName != null &&
      entity.institutionPhone != null &&
      entity.institutionEmail != null &&
      entity.institutionGovernorate != null &&
      entity.institutionCity != null
    ) {
      institutionProfile = new InstitutionProfile(
        entity.institutionName,
        entity.institutionPhone,
        entity.institutionEmail,
        entity.institutionGovernorate,
        entity.institutionCity,
        entity.website ?? '',
        entity.typeOfServices ?? [],
        entity.accessible ?? false,
        entity.specificEquipment ?? [],
      );
    }

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

    if (domain.handicapProfile) {
      entity.handicapCardId = domain.handicapProfile.handicapCardId;
      entity.dateOfBirth = domain.handicapProfile.dateOfBirth;
      entity.governorate = domain.handicapProfile.governorate;
      entity.city = domain.handicapProfile.city;
      entity.handicapType = domain.handicapProfile.handicapType;
      entity.requiredAccommodation =
        domain.handicapProfile.requiredAccommodation;
      entity.occupationStatus = domain.handicapProfile.occupationStatus;
      entity.caregiver = domain.handicapProfile.caregiver;
    }

    if (domain.institutionProfile) {
      entity.institutionName = domain.institutionProfile.institutionName;
      entity.institutionPhone = domain.institutionProfile.institutionPhone;
      entity.institutionEmail = domain.institutionProfile.institutionEmail;
      entity.institutionGovernorate =
        domain.institutionProfile.institutionGovernorate;
      entity.institutionCity = domain.institutionProfile.institutionCity;
      entity.website = domain.institutionProfile.website;
      entity.typeOfServices = domain.institutionProfile.typeOfServices;
      entity.accessible = domain.institutionProfile.accessible;
      entity.specificEquipment = domain.institutionProfile.specificEquipment;
    }

    return entity;
  }
}
