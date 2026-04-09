import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsDate,
  Matches,
  IsUrl,
  IsInt,
  Length,
} from 'class-validator';
import { OccupationStatus } from '@domain/enums/user.enum';
export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\+\d{8,15}$/, {
    message: 'phone must be in E.164 format like +21612345678',
  })
  phone!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password!: string;

  @IsNotEmpty()
  @IsInt()
  roleId!: number;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only digits' })
  otpCode!: string;

  /**
   * Handicap profile fields
   */
  @IsOptional()
  @IsString()
  handicapCardId?: string;

  @IsOptional()
  @IsDate()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  governorate?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  handicapType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredAccommodation?: string[];

  @IsOptional()
  @IsEnum(OccupationStatus)
  occupationStatus?: OccupationStatus;

  @IsOptional()
  @IsBoolean()
  caregiver?: boolean;

  /**
   * Institution profile fields
   */
  @IsOptional()
  @IsString()
  institutionName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+\d{8,15}$/, {
    message: 'institutionPhone must be in E.164 format like +21612345678',
  })
  institutionPhone?: string;

  @IsOptional()
  @IsEmail()
  institutionEmail?: string;

  @IsOptional()
  @IsString()
  institutionGovernorate?: string;

  @IsOptional()
  @IsString()
  institutionCity?: string;

  @IsOptional()
  @IsUrl(
    { require_protocol: true },
    { message: 'website must include http(s)://' },
  )
  website?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  typeOfServices?: string[];

  @IsOptional()
  @IsBoolean()
  accessible?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specificEquipment?: string[];
}
