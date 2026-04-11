import { gqlRequest, gqlUpload } from "./graphql/graphql-client";
import type { AuthResult } from "@/domain/models/authResult";

const SEND_VERIFICATION_EMAIL = `
  mutation SendVerificationEmail($input: SendEmailInput!) {
    sendVerificationEmail(input: $input)
  }
`;

const REQUEST_PASSWORD_RESET = `
  mutation RequestPasswordReset($input: SendEmailInput!) {
    requestPasswordReset(input: $input)
  }
`;

const LOGIN_WITH_EMAIL = `
  mutation LoginWithEmail($input: LoginWithEmailInput!) {
    loginWithEmail(input: $input) {
      accessToken
      message
    }
  }
`;

const LOGIN_WITH_HANDICAP_CARD = `
  mutation LoginWithHandicapCard($input: LoginWithHandicapCardInput!) {
    loginWithHandicapCard(input: $input)
  }
`;

const REGISTER = `
  mutation Register($input: RegisterInput!, $files: [Upload!], $documentTypes: [String!]) {
    register(input: $input, files: $files, documentTypes: $documentTypes) {
      id
      fullName
      email
      phone
      status
      roleId
      createdAt
      updatedAt
      handicapProfile {
        handicapCardId
        dateOfBirth
        governorate
        city
        handicapType
        requiredAccommodation
        occupationStatus
        caregiver
      }
      institutionProfile {
        institutionName
        institutionPhone
        institutionEmail
        institutionGovernorate
        institutionCity
        website
        typeOfServices
        accessible
        specificEquipment
      }
    }
  }
`;

const RESET_PASSWORD = `
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`;

const LOGOUT = `
  mutation Logout {
    logout
  }
`;

export async function sendVerificationEmailApi(
  input: Record<string, unknown>,
): Promise<boolean> {
  const data = await gqlRequest<{ sendVerificationEmail: boolean }>(
    SEND_VERIFICATION_EMAIL,
    { input },
  );
  return data.sendVerificationEmail;
}

export async function requestPasswordResetApi(
  input: Record<string, unknown>,
): Promise<boolean> {
  const data = await gqlRequest<{ requestPasswordReset: boolean }>(
    REQUEST_PASSWORD_RESET,
    { input },
  );
  return data.requestPasswordReset;
}

export async function loginWithEmailApi(
  input: Record<string, unknown>,
): Promise<AuthResult> {
  const data = await gqlRequest<{ loginWithEmail: AuthResult }>(
    LOGIN_WITH_EMAIL,
    { input },
  );
  return data.loginWithEmail;
}

export async function loginWithHandicapCardApi(
  input: Record<string, unknown>,
): Promise<boolean> {
  const data = await gqlRequest<{ loginWithHandicapCard: boolean }>(
    LOGIN_WITH_HANDICAP_CARD,
    { input },
  );
  return data.loginWithHandicapCard;
}

export async function registerApi(
  input: Record<string, unknown>,
  files?: { field: string; file: File }[],
  documentTypes?: string[],
): Promise<Record<string, unknown>> {
  if (files?.length) {
    const data = await gqlUpload<{ register: Record<string, unknown> }>(
      REGISTER,
      { input, documentTypes },
      files,
    );
    return data.register;
  }

  const data = await gqlRequest<{ register: Record<string, unknown> }>(
    REGISTER,
    { input, documentTypes },
  );
  return data.register;
}

export async function resetPasswordApi(
  input: Record<string, unknown>,
): Promise<boolean> {
  const data = await gqlRequest<{ resetPassword: boolean }>(RESET_PASSWORD, {
    input,
  });
  return data.resetPassword;
}

export async function logoutApi(): Promise<boolean> {
  const data = await gqlRequest<{ logout: boolean }>(LOGOUT);
  return data.logout;
}
