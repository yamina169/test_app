import { InputType, Field, Int } from '@nestjs/graphql';
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
  IsInt,
  IsUrl,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OccupationStatus } from '@common/enums/user.enum';

@InputType()
export class RegisterInput {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Field()
  fullName: string;

  @IsEmail()
  @Field()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\+\d{8,15}$/, { message: 'phone must be in E.164 format' })
  @Field()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Field()
  password: string;

  @IsNotEmpty()
  @IsInt()
  @Field(() => Int)
  roleId: number;

  // Handicap profile fields
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Field({ nullable: true })
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  governorate?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  city?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  handicapType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  requiredAccommodation?: string[];

  @IsOptional()
  @IsEnum(OccupationStatus)
  @Field(() => OccupationStatus, { nullable: true })
  occupationStatus?: OccupationStatus;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  caregiver?: boolean;

  // Institution profile fields
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  institutionName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+\d{8,15}$/, {
    message: 'institutionPhone must be in E.164 format',
  })
  @Field({ nullable: true })
  institutionPhone?: string;

  @IsOptional()
  @IsEmail()
  @Field({ nullable: true })
  institutionEmail?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  institutionGovernorate?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  institutionCity?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @Field({ nullable: true })
  website?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  typeOfServices?: string[];

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  accessible?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  specificEquipment?: string[];
}
