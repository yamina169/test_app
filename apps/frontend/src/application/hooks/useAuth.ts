"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBackendError } from "@/application/hooks/useBackendError";
import {
  loginWithEmailService,
  loginWithHandicapCardService,
  registerService,
  resetPasswordService,
  sendVerificationEmailService,
  requestPasswordResetService,
  logoutService,
} from "@/application/services/auth.service";
import {
  loginWithEmailSchema,
  loginWithHandicapCardSchema,
  registerSchema,
  resetPasswordSchema,
  type LoginWithEmailValues,
  type LoginWithHandicapCardValues,
  type RegisterValues,
  type ResetPasswordValues,
} from "@/lib/schemas/auth.schema";

const TOKEN_KEY = "auth_token";

export const saveToken = (token: string) =>
  localStorage.setItem(TOKEN_KEY, token);

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

function useAsyncState() {
  const { resolveError } = useBackendError();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async (fn: () => Promise<void>) => {
    setIsPending(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(resolveError(e));
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, error, handle, setError };
}

export function useLoginWithEmail() {
  const router = useRouter();
  const { isPending, error, handle, setError } = useAsyncState();

  const submit = async (values: LoginWithEmailValues) => {
    const parsed = loginWithEmailSchema.safeParse(values);
    if (!parsed.success) {
      setError("Invalid form data");
      return;
    }

    await handle(async () => {
      const result = await loginWithEmailService(
        parsed.data.email,
        parsed.data.password,
      );
      saveToken(result.accessToken);
      router.push("/");
    });
  };

  return { submit, isPending, error };
}

export function useLoginWithHandicapCard() {
  const { isPending, error, handle, setError } = useAsyncState();
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const submit = async (
    values: LoginWithHandicapCardValues,
    locale: string,
  ) => {
    const parsed = loginWithHandicapCardSchema.safeParse(values);
    if (!parsed.success) {
      setError("Invalid form data");
      return;
    }

    await handle(async () => {
      await loginWithHandicapCardService(parsed.data.handicapCardId, locale);
      setMagicLinkSent(true);
    });
  };

  return { submit, isPending, error, magicLinkSent };
}

export function useRegister() {
  const { isPending, error, handle, setError } = useAsyncState();

  const submit = async (
    values: RegisterValues,
    files?: { field: string; file: File }[],
    documentTypes?: string[],
  ) => {
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setError("Invalid form data");
      return;
    }

    await handle(async () => {
      await registerService(
        parsed.data as Record<string, unknown>,
        files,
        documentTypes,
      );
    });
  };

  return { submit, isPending, error };
}

export function useResetPassword() {
  const { isPending, error, handle, setError } = useAsyncState();
  const [success, setSuccess] = useState(false);

  const submit = async (values: ResetPasswordValues) => {
    const parsed = resetPasswordSchema.safeParse(values);
    if (!parsed.success) {
      setError("Invalid form data");
      return;
    }

    await handle(async () => {
      await resetPasswordService(
        parsed.data.email,
        parsed.data.code,
        parsed.data.newPassword,
      );
      setSuccess(true);
    });
  };

  return { submit, isPending, error, success };
}

export function useSendVerificationEmail() {
  const { isPending, error, handle } = useAsyncState();
  const [emailSent, setEmailSent] = useState(false);

  const submit = async (email: string, locale: string) => {
    await handle(async () => {
      await sendVerificationEmailService(email, locale);
      setEmailSent(true);
    });
  };

  return { submit, isPending, error, emailSent };
}

export function useRequestPasswordReset() {
  const { isPending, error, handle } = useAsyncState();
  const [emailSent, setEmailSent] = useState(false);

  const submit = async (email: string, locale: string) => {
    await handle(async () => {
      await requestPasswordResetService(email, locale);
      setEmailSent(true);
    });
  };

  return { submit, isPending, error, emailSent };
}

export function useLogout() {
  const router = useRouter();
  const { isPending, error, handle } = useAsyncState();

  const logout = async () => {
    await handle(async () => {
      await logoutService();
      clearToken();
      router.push("/auth/login");
    });
  };

  return { logout, isPending, error };
}
