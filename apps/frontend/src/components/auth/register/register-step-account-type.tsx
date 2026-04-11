"use client";

import * as React from "react";
import { User, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { AccountType } from "./register-form";

const ACCOUNT_OPTIONS = [
  {
    key: "handicapped" as AccountType,
    labelKey: "handicapped",
    Icon: User,
    roleId: 2,
  },
  {
    key: "institution" as AccountType,
    labelKey: "institution",
    Icon: Building2,
    roleId: 3,
  },
];

interface Props {
  value: AccountType | null;
  onChange: (type: AccountType, roleId: number) => void;
}

export const RegisterStepAccountType = React.memo(
  function RegisterStepAccountType({ value, onChange }: Props) {
    const t = useTranslations("register.accountType");

    return (
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-base font-semibold">
            {t("legend")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <fieldset className="border-0 p-0 m-0">
            <legend className="sr-only">{t("legend")}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {ACCOUNT_OPTIONS.map(({ key, labelKey, Icon, roleId }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChange(key, roleId)}
                  aria-pressed={value === key}
                  className={[
                    "flex min-h-20 w-full flex-col items-center justify-center gap-3",
                    "rounded-2xl border-2 p-4 text-center text-sm font-medium transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "sm:p-5 md:p-6",
                    value === key
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-foreground hover:border-primary/40",
                  ].join(" ")}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </fieldset>
        </CardContent>
      </Card>
    );
  },
);
