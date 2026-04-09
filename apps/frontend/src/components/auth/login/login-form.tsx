"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form/field";
import { ErrorSummary } from "@/components/form/error-summary";
import { useZodForm } from "@/application/hooks/useZodForm";
import { useAuth } from "@/application/hooks/useAuth";
import {
  loginWithEmailSchema,
  type LoginWithEmailValues,
} from "@/lib/schemas/auth.schema";
import { loginInitialValues, loginFieldIds } from "@/domain/data/auth.data";
import Link from "next/link";

export function LoginForm() {
  const t = useTranslations("login");
  const tErrors = useTranslations("login.errors");
  const { login, isLoading, error: authError } = useAuth();

  const summaryRef = React.useRef<HTMLDivElement | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const form = useZodForm<LoginWithEmailValues>({
    initialValues: loginInitialValues,
    schema: loginWithEmailSchema,
    summaryRef,
    // Strip "errors." prefix — tErrors namespace is already "login.errors"
    t: (key) => tErrors(key.replace("errors.", "")),
  });

  function focusField(key: keyof LoginWithEmailValues) {
    const el = document.getElementById(loginFieldIds[key]);
    el?.focus();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = form.validate();
    if (!res.ok) return;

    await login({ email: res.values.email, password: res.values.password });
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mt-6 space-y-4"
      aria-label={t("formAriaLabel")}
    >
      <ErrorSummary<LoginWithEmailValues>
        title={t("errors.summaryTitle")}
        errors={form.errors}
        summaryRef={summaryRef}
        onFocusField={focusField}
      />

      {authError && (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          {authError}
        </p>
      )}

      <FormField
        id={loginFieldIds.email}
        label={t("fields.email")}
        name="email"
        type="email"
        required
        autoComplete="email"
        value={form.values.email}
        onChange={(v) => form.setField("email", v)}
        error={form.errors.email}
      />

      <div className="space-y-1.5 relative">
        <FormField
          id={loginFieldIds.password}
          label={t("fields.password")}
          name="password"
          type={showPassword ? "text" : "password"}
          required
          autoComplete="current-password"
          value={form.values.password}
          onChange={(v) => form.setField("password", v)}
          error={form.errors.password}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute insest-e-1 top-7 h-10 w-10 text-muted-foreground hover:text-foreground"
          aria-label={
            showPassword ? t("fields.hidePassword") : t("fields.showPassword")
          }
          aria-pressed={showPassword}
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Eye className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* FIXED Forgot Password Link */}
      <div className="text-right">
        <Link
          href="/forgot-password"
          className="inline-block text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          {t("actions.forgotPassword")}
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full h-12 rounded-xl text-base font-medium"
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? t("actions.submitting") : t("actions.submit")}
      </Button>
    </form>
  );
}
