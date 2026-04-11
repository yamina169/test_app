import {
  HandicapProfile,
  InstitutionProfile,
  OtpData,
  User,
} from '@domain/entities/user.entity';
import { UserEntity } from '../database/entities/user.entity';
import { RoleEntity } from '../database/entities/role.entity';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    if (!entity.role) {
      throw new Error('UserMapper: role must be loaded');
    }

    const handicapProfile = HandicapProfile.create({
      dateOfBirth: entity.dateOfBirth ?? undefined,
      governorate: entity.governorate ?? undefined,
      city: entity.city ?? undefined,
      handicapType: entity.handicapType ?? undefined,
      requiredAccommodation: entity.requiredAccommodation ?? undefined,
      occupationStatus: entity.occupationStatus ?? undefined,
      caregiver: entity.caregiver ?? undefined,
      handicapCardId: entity.handicapCardId ?? undefined,
    });

    const institutionProfile = InstitutionProfile.create({
      institutionName: entity.institutionName ?? undefined,
      institutionPhone: entity.institutionPhone ?? undefined,
      institutionEmail: entity.institutionEmail ?? undefined,
      institutionGovernorate: entity.institutionGovernorate ?? undefined,
      institutionCity: entity.institutionCity ?? undefined,
      website: entity.website ?? undefined,
      typeOfServices: entity.typeOfServices ?? undefined,
      accessible: entity.accessible ?? undefined,
      specificEquipment: entity.specificEquipment ?? undefined,
    });

    const otpData =
      entity.otpCode && entity.otpExpiresAt
        ? new OtpData(entity.otpCode, entity.otpExpiresAt)
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
      otpData,
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
    entity.otpCode = domain.otpData?.code ?? undefined;
    entity.otpExpiresAt = domain.otpData?.expiresAt ?? undefined;

    return entity;
  }
}
