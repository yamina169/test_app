import {
  sendVerificationEmail,
  loginWithEmail,
  loginWithHandicapCard,
  requestPasswordReset,
  resetPassword,
  logout as logoutRequest,
  register,
} from "@/infrastructure/api/auth.api";

import type { User } from "@/domain/models/user";
import type { AuthResult } from "@/domain/models/authResult";
import type { RegisterInput } from "@/infrastructure/api/auth.api";

const TOKEN_KEY = "access_token";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getStoredToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

function storeToken(token: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

export async function login(credentials: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const result = await loginWithEmail(credentials);
  storeToken(result.accessToken);
  return result;
}

export async function loginWithCard(credentials: {
  handicapCardId: string;
  locale: string;
}): Promise<string> {
  return loginWithHandicapCard(credentials);
}

export async function registerUser(
  payload: RegisterInput,
  files?: { file: File; documentType: string }[],
): Promise<User> {
  return register(payload, files);
}

export async function sendOtp(input: {
  email: string;
  locale: string;
}): Promise<boolean> {
  return sendVerificationEmail(input);
}

export async function requestReset(input: {
  email: string;
  locale: string;
}): Promise<boolean> {
  return requestPasswordReset(input);
}

export async function confirmReset(payload: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<boolean> {
  return resetPassword(payload);
}

export async function logout(): Promise<void> {
  await logoutRequest();
  clearToken();
}
