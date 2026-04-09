"use client";

import { useState, useCallback, useMemo } from "react";
import { useBackendError } from "@/application/hooks/useBackendError"; // ← ajout

import {
  login,
  loginWithCard,
  registerUser,
  sendOtp,
  requestReset,
  confirmReset,
  logout,
  isAuthenticated,
} from "@/application/services/auth.service";

import type { User } from "@/domain/models/user";
import type { AuthResult } from "@/domain/models/authResult";
import type { RegisterInput } from "@/infrastructure/api/auth.api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null,
  });

  const { resolveError } = useBackendError(); // ← ajout

  const authenticated = useMemo(() => isAuthenticated(), []);

  const setLoading = useCallback(
    () => setState((s) => ({ ...s, isLoading: true, error: null })),
    [],
  );

  const setError = useCallback(
    (message: string) =>
      setState((s) => ({ ...s, isLoading: false, error: message })),
    [],
  );

  const setDone = useCallback(
    (user?: User | null) =>
      setState((s) => ({
        ...s,
        isLoading: false,
        error: null,
        user: user ?? s.user,
      })),
    [],
  );

  // ── Actions ───────────────────────────────────────────────────

  const handleLogin = useCallback(
    async (credentials: {
      email: string;
      password: string;
    }): Promise<AuthResult | null> => {
      try {
        setLoading();
        const result = await login(credentials);
        setDone();
        return result;
      } catch (e) {
        setError(resolveError(e)); // ← était : e instanceof Error ? e.message : "Login failed"
        return null;
      }
    },
    [setLoading, setDone, setError, resolveError],
  );

  const handleLoginWithCard = useCallback(
    async (credentials: {
      handicapCardId: string;
      locale: string;
    }): Promise<string | null> => {
      try {
        setLoading();
        const result = await loginWithCard(credentials);
        setDone();
        return result;
      } catch (e) {
        setError(resolveError(e)); // ← était : "Login with card failed"
        return null;
      }
    },
    [setLoading, setDone, setError, resolveError],
  );

  const handleRegister = useCallback(
    async (
      payload: RegisterInput,
      files?: { file: File; documentType: string }[],
    ): Promise<User | null> => {
      try {
        setLoading();
        const user = await registerUser(payload, files);
        setDone();
        return user;
      } catch (e) {
        setError(resolveError(e)); // ← était : "Register failed"
        return null;
      }
    },
    [setLoading, setDone, setError, resolveError],
  );

  const handleSendOtp = useCallback(
    async (input: { email: string; locale: string }): Promise<boolean> => {
      try {
        setLoading();
        const result = await sendOtp(input);
        setDone();
        return result;
      } catch (e) {
        setError(resolveError(e)); // ← était : "Failed to send OTP"
        return false;
      }
    },
    [setLoading, setDone, setError, resolveError],
  );

  const handleRequestReset = useCallback(
    async (input: { email: string; locale: string }): Promise<boolean> => {
      try {
        setLoading();
        const result = await requestReset(input);
        setDone();
        return result;
      } catch (e) {
        setError(resolveError(e)); // ← était : "Failed to request reset"
        return false;
      }
    },
    [setLoading, setDone, setError, resolveError],
  );

  const handleConfirmReset = useCallback(
    async (payload: {
      email: string;
      code: string;
      newPassword: string;
    }): Promise<boolean> => {
      try {
        setLoading();
        const result = await confirmReset(payload);
        setDone();
        return result;
      } catch (e) {
        setError(resolveError(e)); // ← était : "Failed to reset password"
        return false;
      }
    },
    [setLoading, setDone, setError, resolveError],
  );

  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      setLoading();
      await logout();
      setState({ user: null, isLoading: false, error: null });
    } catch (e) {
      setError(resolveError(e)); // ← était : "Logout failed"
    }
  }, [setLoading, setError, resolveError]);

  return {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated: authenticated,
    login: handleLogin,
    loginWithCard: handleLoginWithCard,
    register: handleRegister,
    sendOtp: handleSendOtp,
    requestReset: handleRequestReset,
    confirmReset: handleConfirmReset,
    logout: handleLogout,
  };
}
