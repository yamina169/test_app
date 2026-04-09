"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { ResetHeader } from "@/components/auth/resetPassword/reset-header";
import { RequestResetForm } from "@/components/auth/resetPassword/request-reset-form";
import { ConfirmResetForm } from "@/components/auth/resetPassword/confirm-reset-form";
import { Button } from "@/components/ui/button";

type Step = "request" | "confirm" | "success";

export default function ResetPasswordPage() {
  const t = useTranslations("resetPassword");
  const [step, setStep] = React.useState<Step>("request");
  const [email, setEmail] = React.useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl border border-border shadow-lg md:h-150">
        {/* Brand panel — desktop only, same as login */}
        <div className="hidden md:flex md:w-[45%]">
          <AuthBrandPanel />
        </div>

        {/* Form panel */}
        <main
          id="main-content"
          className="flex w-full flex-col justify-center bg-card p-8 md:w-[55%] md:p-12"
        >
          {/* Header with step icon (except success) */}
          {step !== "success" && <ResetHeader step={step} />}

          {/* Step 1: Request email */}
          {step === "request" && (
            <RequestResetForm
              onSuccess={(sentTo) => {
                setEmail(sentTo);
                setStep("confirm");
              }}
            />
          )}

          {/* Step 2: Confirm code + new password */}
          {step === "confirm" && (
            <ConfirmResetForm
              email={email}
              onSuccess={() => setStep("success")}
            />
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col items-center gap-6 text-center"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg"
                aria-hidden="true"
              >
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>

              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {t("success.title")}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("success.subtitle")}
                </p>
              </div>

              <Button
                asChild
                className="w-full h-12 rounded-xl text-base font-medium"
              >
                <Link href="/login">{t("success.goLogin")}</Link>
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
