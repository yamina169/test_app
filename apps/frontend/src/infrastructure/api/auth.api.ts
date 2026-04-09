import { gqlRequest, gqlUpload } from "./client";
import {
  SEND_VERIFICATION_EMAIL,
  LOGIN_WITH_EMAIL,
  LOGIN_WITH_HANDICAP_CARD,
  REQUEST_PASSWORD_RESET,
  RESET_PASSWORD,
  LOGOUT,
  REGISTER,
} from "./graphql/auth.mutations";
import type { User } from "@/domain/models/user";
import type { AuthResult } from "@/domain/models/authResult";

export interface SendEmailInput {
  email: string;
  locale: string;
}

export interface LoginWithEmailInput {
  email: string;
  password: string;
}

export interface LoginWithHandicapCardInput {
  handicapCardId: string;
  locale: string;
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  roleId: number;
  otpCode: string;
  handicapCardId?: string;
  dateOfBirth?: Date;
  governorate?: string;
  city?: string;
  handicapType?: string;
  requiredAccommodation?: string[];
  occupationStatus?: string;
  caregiver?: boolean;
  institutionName?: string;
  institutionPhone?: string;
  institutionEmail?: string;
  institutionGovernorate?: string;
  institutionCity?: string;
  website?: string;
  typeOfServices?: string[];
  accessible?: boolean;
  specificEquipment?: string[];
}

export interface RegisterFileInput {
  file: File;
  documentType: string;
}

export async function sendVerificationEmail(
  input: SendEmailInput,
): Promise<boolean> {
  const data = await gqlRequest<{ sendVerificationEmail: boolean }>(
    SEND_VERIFICATION_EMAIL,
    { input },
  );
  return data.sendVerificationEmail;
}

export async function loginWithEmail(
  input: LoginWithEmailInput,
): Promise<AuthResult> {
  const data = await gqlRequest<{ loginWithEmail: AuthResult }>(
    LOGIN_WITH_EMAIL,
    { input },
  );
  return data.loginWithEmail;
}

export async function loginWithHandicapCard(
  input: LoginWithHandicapCardInput,
): Promise<string> {
  const data = await gqlRequest<{ loginWithHandicapCard: string }>(
    LOGIN_WITH_HANDICAP_CARD,
    { input },
  );
  return data.loginWithHandicapCard;
}

export async function requestPasswordReset(
  input: SendEmailInput,
): Promise<boolean> {
  const data = await gqlRequest<{ requestPasswordReset: boolean }>(
    REQUEST_PASSWORD_RESET,
    { input },
  );
  return data.requestPasswordReset;
}

export async function resetPassword(
  input: ResetPasswordInput,
): Promise<boolean> {
  const data = await gqlRequest<{ resetPassword: boolean }>(RESET_PASSWORD, {
    input,
  });
  return data.resetPassword;
}

export async function logout(): Promise<boolean> {
  const data = await gqlRequest<{ logout: boolean }>(LOGOUT);
  return data.logout;
}

export async function register(
  input: RegisterInput,
  files: RegisterFileInput[] = [],
): Promise<User> {
  const cleanInput = Object.fromEntries(
    Object.entries(input).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    ),
  ) as RegisterInput;

  const uploadFiles = files.map((f, index) => ({
    field: `files.${index}`,
    file: f.file,
  }));

  const documentTypes = files.map((f) => f.documentType);

  const data = await gqlUpload<{ register: User }>(
    REGISTER,
    {
      input: cleanInput,
      files: files.length > 0 ? files.map(() => null) : null,
      documentTypes: documentTypes.length > 0 ? documentTypes : null,
    },
    uploadFiles,
  );

  return data.register;
}
