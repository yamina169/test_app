import { AccountStatus, OccupationStatus } from '@domain/enums/user.enum';

/**
 * profiles
 */
export class HandicapProfile {
  constructor(
    public readonly dateOfBirth: Date,
    public readonly governorate: string,
    public readonly city: string,
    public readonly handicapType: string,
    public readonly requiredAccommodation: string[],
    public readonly occupationStatus: OccupationStatus,
    public readonly caregiver: boolean,
    public readonly handicapCardId: string,
  ) {}
}
export class InstitutionProfile {
  constructor(
    public readonly institutionName: string,
    public readonly institutionPhone: string,
    public readonly institutionEmail: string,
    public readonly institutionGovernorate: string,
    public readonly institutionCity: string,
    public readonly website: string,
    public readonly typeOfServices: string[],
    public readonly accessible: boolean,
    public readonly specificEquipment: string[],
  ) {}
}

/**
 * User Entity
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly fullName: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly password: string,
    public readonly status: AccountStatus,
    public readonly roleId: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly handicapProfile: HandicapProfile | null,
    public readonly institutionProfile: InstitutionProfile | null,
  ) {}
}
