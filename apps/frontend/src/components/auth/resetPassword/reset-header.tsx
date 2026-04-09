// src/components/auth/resetPassword/reset-header.tsx
import { KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  step: "request" | "confirm" | "success";
}

export function ResetHeader({ step }: Props) {
  const t = useTranslations("resetPassword");

  const titles = {
    request: { title: t("stepEmail.title"), subtitle: t("stepEmail.subtitle") },
    confirm: {
      title: t("stepConfirm.title"),
      subtitle: t("stepConfirm.subtitleShort"),
    },
    success: { title: t("success.title"), subtitle: t("success.subtitle") },
  };

  const { title, subtitle } = titles[step];

  return (
    <div className="mb-8 flex items-center gap-4">
      {/* Même conteneur que LoginHeader — icône changée : KeyRound */}
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, hsl(222, 89%, 42%), hsl(226, 52%, 18%))",
        }}
        aria-hidden="true"
      >
        <KeyRound className="h-6 w-6 text-white" />
      </div>

      {/* WCAG 2.4.6 — heading + subtitle changent selon l'étape */}
      <div aria-live="polite" aria-atomic="true">
        <h1 className="font-display text-2xl font-bold text-foreground">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
