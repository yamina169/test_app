// components/auth/login/login-with-carte.tsx
"use client";

import * as React from "react";
import { AlertCircle, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form/field";
import { ErrorSummary } from "@/components/form/error-summary";
import { useZodForm } from "@/application/hooks/useZodForm";
import { useAuth } from "@/application/hooks/useAuth";
import {
  loginWithHandicapCardSchema,
  type LoginWithHandicapCardValues,
} from "@/lib/schemas/auth.schema";
import {
  loginWithCardInitialValues,
  loginWithCardFieldIds,
} from "@/domain/data/auth.data";

export function LoginWithCard() {
  const t = useTranslations("login");
  const tErrors = useTranslations("login.errors");
  const { loginWithCard, isLoading, error: authError } = useAuth();

  // WCAG 2.4.3 + 3.3.1: summary ref receives focus after a failed submit attempt
  const summaryRef = React.useRef<HTMLDivElement | null>(null);

  const form = useZodForm<LoginWithHandicapCardValues>({
    initialValues: loginWithCardInitialValues,
    schema: loginWithHandicapCardSchema,
    summaryRef,
    // Strip "errors." prefix — tErrors namespace is already "login.errors"
    t: (key) => tErrors(key.replace("errors.", "")),
  });

  function focusField(key: keyof LoginWithHandicapCardValues) {
    document.getElementById(loginWithCardFieldIds[key])?.focus();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = form.validate();
    if (!res.ok) return;
    await loginWithCard({
      handicapCardId: res.values.handicapCardId,
      locale: "fr",
    });
  }

  return (
    <div className="mt-6 space-y-4">
      {/*
        WCAG 1.3.1 + 3.3.2: the notice is a role="note" landmark so screen
        readers can identify it as supplementary information, not an error.
      */}
      <div
        className="rounded-2xl border border-border bg-muted/40 p-4"
        role="note"
        aria-label={t("carteNotice.title")}
      >
        <div className="flex items-start gap-3">
          {/* aria-hidden: icon is decorative — label on the container conveys meaning */}
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-medium text-foreground">
              {t("carteNotice.title")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("carteNotice.description")}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-4"
        aria-label={t("carteFormAriaLabel")}
      >
        {/* WCAG 3.3.1: error summary with aria-live="assertive" + programmatic focus */}
        <ErrorSummary<LoginWithHandicapCardValues>
          title={t("errors.summaryTitle")}
          errors={form.errors}
          summaryRef={summaryRef}
          onFocusField={focusField}
        />

        {/* WCAG 4.1.3: backend error surfaced as role="alert" status message */}
        {authError && (
          <p
            role="alert"
            aria-live="assertive"
            className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
          >
            {authError}
          </p>
        )}

        {/*
          WCAG 1.3.5: autocomplete="off" for card ID (not a standard credential),
          FormField handles label association + aria-invalid + aria-errormessage.
        */}
        <FormField
          id={loginWithCardFieldIds.handicapCardId}
          label={t("fields.cardId")}
          name="handicapCardId"
          type="text"
          required
          autoComplete="off"
          value={form.values.handicapCardId}
          onChange={(v) => form.setField("handicapCardId", v)}
          error={form.errors.handicapCardId}
          hint={t("fields.cardIdHint")}
        />

        {/* WCAG 2.5.5: min touch target 48px (h-12), aria-busy for loading state */}
        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-base font-medium gap-2"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          <CreditCard className="h-5 w-5" aria-hidden="true" />
          {isLoading ? t("actions.submitting") : t("actions.submitWithCarte")}
        </Button>
      </form>
    </div>
  );
}
