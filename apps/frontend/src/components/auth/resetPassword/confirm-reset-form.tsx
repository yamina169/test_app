// src/components/auth/reset-password/confirm-reset-form.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form/field";
import { ErrorSummary } from "@/components/form/error-summary";
import { useZodForm } from "@/application/hooks/useZodForm";
import { useAuth } from "@/application/hooks/useAuth";
import {
  confirmResetSchema,
  type ConfirmResetValues,
} from "@/lib/schemas/auth.schema";
import {
  confirmResetInitialValues,
  confirmResetFieldIds,
} from "@/domain/data/auth.data";

interface Props {
  email: string;
  onSuccess: () => void;
}

export function ConfirmResetForm({ email, onSuccess }: Props) {
  const t = useTranslations("resetPassword");
  const tErrors = useTranslations("resetPassword.errors");

  const { confirmReset, isLoading, error: authError } = useAuth();
  const summaryRef = React.useRef<HTMLDivElement | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useZodForm<ConfirmResetValues>({
    initialValues: confirmResetInitialValues,
    schema: confirmResetSchema,
    summaryRef,
    t: (key) => tErrors(key.replace("errors.", "")),
  });

  function focusField(key: keyof ConfirmResetValues) {
    document.getElementById(confirmResetFieldIds[key])?.focus();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = form.validate();
    if (!res.ok) return;

    const ok = await confirmReset({
      email,
      code: res.values.code,
      newPassword: res.values.newPassword,
    });
    if (ok) onSuccess();
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mt-6 space-y-4"
      aria-label={t("stepConfirm.formAriaLabel")}
    >
      {/* WCAG 3.3.3 — Show which email the code was sent to */}
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {t("stepConfirm.subtitle", { email })}
      </p>

      {/* WCAG 3.3.1 — Error summary */}
      <ErrorSummary<ConfirmResetValues>
        title={t("errors.summaryTitle")}
        errors={form.errors}
        summaryRef={summaryRef}
        onFocusField={focusField}
      />

      {/* WCAG 4.1.3 — Backend error */}
      {authError && (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          {authError}
        </p>
      )}

      {/* OTP code — inputmode="numeric" for mobile numeric keyboard */}
      <FormField
        id={confirmResetFieldIds.code}
        label={t("fields.code")}
        name="code"
        type="text"
        required
        autoComplete="one-time-code"
        value={form.values.code}
        onChange={(v) => form.setField("code", v)}
        error={form.errors.code}
        hint={t("fields.codeHint")}
      />

      {/* Password field with RTL-safe show/hide toggle */}
      <div className="relative space-y-1.5">
        <FormField
          id={confirmResetFieldIds.newPassword}
          label={t("fields.newPassword")}
          name="newPassword"
          type={showPassword ? "text" : "password"}
          required
          autoComplete="new-password"
          value={form.values.newPassword}
          onChange={(v) => form.setField("newPassword", v)}
          error={form.errors.newPassword}
        />
        {/* WCAG 2.5.5 — 40×40 touch target; end-1 = RTL-safe (right in LTR, left in RTL) */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute end-1 top-7 h-10 w-10 text-muted-foreground hover:text-foreground"
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

      <Button
        type="submit"
        className="w-full h-12 rounded-xl text-base font-medium"
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? t("actions.confirming") : t("actions.confirm")}
      </Button>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {t("actions.backToLogin")}
        </Link>
      </div>
    </form>
  );
}
