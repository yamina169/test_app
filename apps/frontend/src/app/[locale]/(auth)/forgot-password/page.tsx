"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { ResetHeader } from "@/components/auth/resetPassword/reset-header";
import { RequestResetForm } from "@/components/auth/resetPassword/request-reset-form";
import { OtpPasswordForm } from "@/components/auth/resetPassword/OtpPasswordForm";
import { Button } from "@/components/ui/button";
import { LanguageSwitcherDropdown } from "@/components/languageSwitcher/language-switcher-dropdown";

type Step = "request" | "otp-password" | "success";

export default function ResetPasswordPage() {
  const t = useTranslations("resetPassword");
  const [step, setStep] = React.useState<Step>("request");
  const [email, setEmail] = React.useState("");

  return (
    <div className="flex min-h-screen flex-col bg-background px-4 py-8">
      <div className="flex justify-end mb-6 w-full max-w-5xl mx-auto">
        <LanguageSwitcherDropdown />
      </div>

      <div className="flex w-full max-w-5xl mx-auto overflow-hidden rounded-3xl border border-border shadow-lg md:h-150">
        <div className="hidden md:flex md:w-[45%]">
          <AuthBrandPanel />
        </div>

        <main
          id="main-content"
          className="flex w-full flex-col justify-center bg-card p-8 md:w-[55%] md:p-12"
        >
          {step !== "success" && (
            <ResetHeader
              step={step === "otp-password" ? "confirm" : "request"}
            />
          )}

          {step === "request" && (
            <RequestResetForm
              onSuccess={(sentTo) => {
                setEmail(sentTo);
                setStep("otp-password");
              }}
            />
          )}

          {step === "otp-password" && (
            <OtpPasswordForm
              email={email}
              onBack={() => setStep("request")}
              onSuccess={() => setStep("success")}
            />
          )}

          {step === "success" && (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col items-center gap-6 text-center"
            >
              <CheckCircle2
                className="h-16 w-16 text-green-500"
                aria-hidden="true"
              />

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
