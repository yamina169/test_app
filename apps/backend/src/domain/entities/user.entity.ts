import { AccountStatus, OccupationStatus } from '@domain/enums/user.enum';

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

  static create(data: {
    dateOfBirth?: Date;
    governorate?: string;
    city?: string;
    handicapType?: string;
    requiredAccommodation?: string[];
    occupationStatus?: OccupationStatus;
    caregiver?: boolean;
    handicapCardId?: string;
  }): HandicapProfile | null {
    if (
      !data.dateOfBirth ||
      !data.governorate ||
      !data.city ||
      !data.handicapType ||
      !data.requiredAccommodation ||
      !data.occupationStatus ||
      data.caregiver == null ||
      !data.handicapCardId
    )
      return null;

    return new HandicapProfile(
      data.dateOfBirth,
      data.governorate,
      data.city,
      data.handicapType,
      data.requiredAccommodation,
      data.occupationStatus,
      data.caregiver,
      data.handicapCardId,
    );
  }
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

  static create(data: {
    institutionName?: string;
    institutionPhone?: string;
    institutionEmail?: string;
    institutionGovernorate?: string;
    institutionCity?: string;
    website?: string;
    typeOfServices?: string[];
    accessible?: boolean;
    specificEquipment?: string[];
  }): InstitutionProfile | null {
    if (
      !data.institutionName ||
      !data.institutionPhone ||
      !data.institutionEmail ||
      !data.institutionGovernorate ||
      !data.institutionCity ||
      !data.website ||
      !data.typeOfServices ||
      data.accessible == null ||
      !data.specificEquipment
    )
      return null;

    return new InstitutionProfile(
      data.institutionName,
      data.institutionPhone,
      data.institutionEmail,
      data.institutionGovernorate,
      data.institutionCity,
      data.website,
      data.typeOfServices,
      data.accessible,
      data.specificEquipment,
    );
  }
}

export class OtpData {
  constructor(
    public readonly code: string,
    public readonly expiresAt: Date,
  ) {}

  isValid(): boolean {
    return this.expiresAt > new Date();
  }
}

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
    public readonly otpData: OtpData | null,
  ) {}
}
