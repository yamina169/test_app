import {
  loginWithEmailApi,
  loginWithHandicapCardApi,
  registerApi,
  resetPasswordApi,
  sendVerificationEmailApi,
  requestPasswordResetApi,
  logoutApi,
} from "@/infrastructure/api/auth.api";

export async function loginWithEmailService(email: string, password: string) {
  return loginWithEmailApi({ email, password });
}

export async function loginWithHandicapCardService(
  handicapCardId: string,
  locale: string,
) {
  return loginWithHandicapCardApi({ handicapCardId, locale });
}

export async function registerService(
  input: Record<string, unknown>,
  files?: { field: string; file: File }[],
  documentTypes?: string[],
) {
  return registerApi(input, files, documentTypes);
}

export async function resetPasswordService(
  email: string,
  code: string,
  newPassword: string,
) {
  return resetPasswordApi({ email, code, newPassword });
}

export async function sendVerificationEmailService(
  email: string,
  locale: string,
) {
  return sendVerificationEmailApi({ email, locale });
}

export async function requestPasswordResetService(
  email: string,
  locale: string,
) {
  return requestPasswordResetApi({ email, locale });
}

export async function logoutService() {
  return logoutApi();
}
