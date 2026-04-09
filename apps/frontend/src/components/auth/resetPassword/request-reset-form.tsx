// src/components/auth/reset-password/request-reset-form.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form/field";
import { ErrorSummary } from "@/components/form/error-summary";
import { useZodForm } from "@/application/hooks/useZodForm";
import { useAuth } from "@/application/hooks/useAuth";
import {
  emailVerificationSchema,
  type EmailVerificationValues,
} from "@/lib/schemas/auth.schema";
import { emailInitialValues, emailFieldIds } from "@/domain/data/auth.data";

interface Props {
  onSuccess: (email: string) => void;
}

export function RequestResetForm({ onSuccess }: Props) {
  const t = useTranslations("resetPassword");
  const tErrors = useTranslations("resetPassword.errors");
  const locale = useLocale();

  const { requestReset, isLoading, error: authError } = useAuth();
  const summaryRef = React.useRef<HTMLDivElement | null>(null);

  const form = useZodForm<EmailVerificationValues>({
    initialValues: emailInitialValues,
    schema: emailVerificationSchema,
    summaryRef,
    t: (key) => tErrors(key.replace("errors.", "")),
  });

  function focusField(key: keyof EmailVerificationValues) {
    document.getElementById(emailFieldIds[key])?.focus();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = form.validate();
    if (!res.ok) return;

    const ok = await requestReset({ email: res.values.email, locale });
    if (ok) onSuccess(res.values.email);
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mt-6 space-y-4"
      aria-label={t("stepEmail.formAriaLabel")}
    >
      {/* WCAG 3.3.1 — Error summary with programmatic focus */}
      <ErrorSummary<EmailVerificationValues>
        title={t("errors.summaryTitle")}
        errors={form.errors}
        summaryRef={summaryRef}
        onFocusField={focusField}
      />

      {/* WCAG 4.1.3 — Backend error as role="alert" */}
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
        id={emailFieldIds.email}
        label={t("fields.email")}
        name="email"
        type="email"
        required
        autoComplete="email"
        value={form.values.email}
        onChange={(v) => form.setField("email", v)}
        error={form.errors.email}
      />

      {/* WCAG 2.5.5 — min 48px touch target */}
      <Button
        type="submit"
        className="w-full h-12 rounded-xl text-base font-medium"
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? t("actions.sending") : t("actions.send")}
      </Button>

      {/* WCAG 2.4.9 — Link purpose clear from link text alone */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          {/* RTL-safe: flip arrow with CSS logical property */}
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {t("actions.backToLogin")}
        </Link>
      </div>
    </form>
  );
}
