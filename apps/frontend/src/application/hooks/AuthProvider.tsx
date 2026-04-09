import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/application/hooks/useAuth";
import type { User } from "@/domain/models/user";
import type { AuthResult } from "@/domain/models/authResult";
import type { RegisterInput } from "@/infrastructure/api/auth.api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<AuthResult | null>;
  loginWithCard: (credentials: {
    handicapCardId: string;
    locale: string;
  }) => Promise<string | null>;
  register: (
    payload: RegisterInput,
    files?: { file: File; documentType: string }[],
  ) => Promise<User | null>;
  sendOtp: (input: { email: string; locale: string }) => Promise<boolean>;
  requestReset: (input: { email: string; locale: string }) => Promise<boolean>;
  confirmReset: (payload: {
    email: string;
    code: string;
    newPassword: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// ── Hook pour consommer le contexte ─────────────────────────────
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
