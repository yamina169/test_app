"use client";

import * as React from "react";
import { AlertCircle, CreditCard } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form/field";
import { ErrorSummary } from "@/components/form/error-summary";
import { useZodForm } from "@/application/hooks/useZodForm";
import { useLoginWithHandicapCard } from "@/application/hooks/useAuth";
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
  const locale = useLocale();
  const {
    submit,
    isPending,
    error: authError,
    magicLinkSent,
  } = useLoginWithHandicapCard();

  const summaryRef = React.useRef<HTMLDivElement | null>(null);

  const form = useZodForm<LoginWithHandicapCardValues>({
    initialValues: loginWithCardInitialValues,
    schema: loginWithHandicapCardSchema,
    summaryRef,
    t: (key) => tErrors(key.replace("errors.", "")),
  });

  function focusField(key: keyof LoginWithHandicapCardValues) {
    document.getElementById(loginWithCardFieldIds[key])?.focus();
  }

  React.useEffect(() => {
    if (magicLinkSent) {
      toast.success(t("toast.magicLinkSent"), {
        description: t("toast.magicLinkSentDescription"),
      });
      form.clear();
    }
  }, [magicLinkSent, form, t]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = form.validate();
    if (!res.ok) return;
    await submit({ handicapCardId: res.values.handicapCardId }, locale);
  }

  return (
    <div className="mt-6 space-y-4">
      <div
        className="rounded-2xl border border-border bg-muted/40 p-4"
        role="note"
        aria-label={t("carteNotice.title")}
      >
        <div className="flex items-start gap-3">
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
        <ErrorSummary<LoginWithHandicapCardValues>
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

        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-base font-medium gap-2"
          disabled={isPending}
          aria-busy={isPending}
        >
          <CreditCard className="h-5 w-5" aria-hidden="true" />
          {isPending ? t("actions.submitting") : t("actions.submitWithCarte")}
        </Button>
      </form>
    </div>
  );
}
