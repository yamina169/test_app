"use client";

import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { RegisterForm } from "@/components/auth/register/register-form";
import { useTranslations } from "next-intl";
import { LanguageSwitcherDropdown } from "@/components/languageSwitcher/language-switcher-dropdown";

export default function RegisterPage() {
  const t = useTranslations("register");

  return (
    <div className="flex min-h-screen flex-col bg-background px-4 py-8">
      <div className="flex justify-end mb-6 w-full max-w-5xl mx-auto">
        <LanguageSwitcherDropdown />
      </div>

      <div className="flex w-full max-w-5xl mx-auto overflow-hidden rounded-3xl border border-border shadow-lg">
        <div className="hidden md:block w-[45%]">
          <AuthBrandPanel />
        </div>

        <div className="flex w-full min-w-0 flex-col bg-card p-8 md:w-[55%]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
