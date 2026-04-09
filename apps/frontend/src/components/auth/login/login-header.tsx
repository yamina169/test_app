// components/auth/login/login-header.tsx
import { Shield } from "lucide-react";
import { useTranslations } from "next-intl";

export function LoginHeader() {
  const t = useTranslations("login");

  return (
    <div className="mb-8 flex items-center gap-4">
      {/*
        WCAG 1.1.1: decorative icon gets aria-hidden so screen readers
        skip it — the heading below already conveys the meaning.
      */}
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, hsl(222, 89%, 42%), hsl(226, 52%, 18%))",
        }}
        aria-hidden="true"
      >
        <Shield className="h-6 w-6 text-white" />
      </div>

      <div>
        {/*
          WCAG 2.4.6: visible, descriptive heading — must sit at the correct
          level in the page hierarchy (h1 for a standalone login page).
        */}
        <h1 className="font-display text-2xl font-bold text-foreground">
          {t("title")}
        </h1>
        {/* WCAG 3.3.2: subtitle gives context before the user interacts */}
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
    </div>
  );
}
