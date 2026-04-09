import { IsEmail, Length, IsString, IsNumberString } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsNumberString()
  @Length(6, 6, { message: 'OTP code must be 6 digits' })
  code!: string;

  @IsString()
  @Length(8, 128, { message: 'Password must be at least 8 characters' })
  newPassword!: string;
}
