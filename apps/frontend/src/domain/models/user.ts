import { AccountStatus, OccupationStatus } from "@/domain/enums/user.enum";

export interface HandicapProfile {
  dateOfBirth: Date;
  governorate: string;
  city: string;
  handicapType: string;
  requiredAccommodation: string[];
  occupationStatus: OccupationStatus;
  caregiver: boolean;
  handicapCardId: string;
}

export interface InstitutionProfile {
  institutionName: string;
  institutionPhone: string;
  institutionEmail: string;
  institutionGovernorate: string;
  institutionCity: string;
  website: string;
  typeOfServices: string[];
  accessible: boolean;
  specificEquipment: string[];
}

export interface OtpData {
  code: string;
  expiresAt: Date;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: AccountStatus;
  roleId: number;
  createdAt: Date;
  updatedAt: Date;
  handicapProfile: HandicapProfile | null;
  institutionProfile: InstitutionProfile | null;
  otpData: OtpData | null;
}
