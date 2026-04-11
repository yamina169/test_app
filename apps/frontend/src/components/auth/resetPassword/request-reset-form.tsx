"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form/field";
import { useRequestPasswordReset } from "@/application/hooks/useAuth";

interface Props {
  onSuccess: (email: string) => void;
}

export function RequestResetForm({ onSuccess }: Props) {
  const t = useTranslations("resetPassword");
  const locale = useLocale();
  const { submit, isPending, error } = useRequestPasswordReset();
  const [email, setEmail] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    await submit(email, locale);

    onSuccess(email);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}

      <FormField
        id="reset-email"
        label={t("fields.email")}
        name="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={setEmail}
      />

      <Button
        type="submit"
        className="w-full h-12 rounded-xl text-base font-medium"
        disabled={isPending || !email}
        aria-busy={isPending}
      >
        {isPending ? t("actions.sending") : t("actions.send")}
      </Button>
    </form>
  );
}
