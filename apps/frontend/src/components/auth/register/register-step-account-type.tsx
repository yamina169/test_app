"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { User, Building2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { AccountType } from "./register-form";

interface RegisterStepAccountTypeProps {
  // null means nothing selected yet
  value: AccountType | null;
  onChange: (v: AccountType, roleId: number) => void;
}

export function RegisterStepAccountType({
  value,
  onChange,
}: RegisterStepAccountTypeProps) {
  const t = useTranslations("register.accountType");

  const options: {
    key: AccountType;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    roleId: number;
  }[] = [
    { key: "handicapped", label: t("handicapped"), Icon: User, roleId: 2 },
    { key: "institution", label: t("institution"), Icon: Building2, roleId: 3 },
  ];

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-base font-semibold">{t("legend")}</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <fieldset className="border-0 p-0 m-0">
          <div className="grid gap-3 sm:grid-cols-2">
            {options.map(({ key, label, Icon, roleId }) => {
              const selected = value === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChange(key, roleId)}
                  aria-pressed={selected}
                  className={[
                    "flex min-h-20 w-full flex-col items-center justify-center gap-3",
                    "rounded-2xl border-2 p-4 text-center text-sm font-medium transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "sm:p-5 md:p-6",
                    selected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-foreground hover:border-primary/40",
                  ].join(" ")}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </CardContent>
    </Card>
  );
}
