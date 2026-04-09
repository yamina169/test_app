import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { RegisterForm } from "@/components/auth/register/register-form";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("register");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl border border-border shadow-lg">
        {/* Left brand panel — shared with login */}
        <div className="hidden md:block w-[45%]">
          <AuthBrandPanel />
        </div>

        {/* Right wizard panel */}
        <div className="flex w-full min-w-0 flex-col bg-card p-8 md:w-[55%]">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          {/* Form — contains progress bar + steps + navigation */}
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
