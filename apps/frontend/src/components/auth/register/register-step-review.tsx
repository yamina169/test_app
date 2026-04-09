"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { RegisterValues } from "@/lib/schemas/auth.schema";
import type { AccountType } from "./register-form";

interface ReviewRowProps {
  label: string;
  value?: string | null;
}

function ReviewRow({ label, value }: ReviewRowProps) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-6">
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-right text-muted-foreground">{value}</span>
    </div>
  );
}

interface RegisterStepReviewProps {
  accountType: AccountType;
  values: Partial<RegisterValues>;
  fileNames: string[];
}

export function RegisterStepReview({
  accountType,
  values,
  fileNames,
}: RegisterStepReviewProps) {
  const t = useTranslations("register.review");
  const isHandicap = accountType === "handicapped";

  const formatDate = (d?: Date) =>
    d
      ? d.toLocaleDateString("fr-TN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : undefined;

  const formatArray = (arr?: string[]) =>
    arr?.length ? arr.join(", ") : undefined;

  return (
    <section aria-labelledby="step5-heading" className="space-y-4">
      <h2 id="step5-heading" className="sr-only">
        {t("title")}
      </h2>

      <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3 text-sm">
        <ReviewRow
          label={t("accountType")}
          value={isHandicap ? t("handicapped") : t("institution")}
        />

        {isHandicap ? (
          <>
            <ReviewRow label={t("fullName")} value={values.fullName} />

            {/* ✅ FIX ICI */}
            <ReviewRow label={t("cardNumber")} value={values.handicapCardId} />

            <ReviewRow label={t("phone")} value={values.phone} />
            <ReviewRow label={t("email")} value={values.email} />
            <ReviewRow
              label={t("dateOfBirth")}
              value={formatDate(values.dateOfBirth)}
            />
            <ReviewRow label={t("governorate")} value={values.governorate} />
            <ReviewRow label={t("city")} value={values.city} />

            <ReviewRow
              label={t("caregiver")}
              value={
                values.caregiver === true
                  ? "Aidant / Tuteur"
                  : values.caregiver === false
                    ? "Moi-même"
                    : undefined
              }
            />

            <ReviewRow label={t("handicapType")} value={values.handicapType} />
            <ReviewRow
              label={t("accommodations")}
              value={formatArray(values.requiredAccommodation)}
            />
          </>
        ) : (
          <>
            <ReviewRow
              label={t("institutionName")}
              value={values.institutionName}
            />
            <ReviewRow label={t("phone")} value={values.institutionPhone} />
            <ReviewRow label={t("email")} value={values.institutionEmail} />
            <ReviewRow
              label={t("governorate")}
              value={values.institutionGovernorate}
            />
            <ReviewRow label={t("city")} value={values.institutionCity} />
            <ReviewRow label={t("website")} value={values.website} />

            {/* ✅ FIX ICI */}
            <ReviewRow
              label={t("services")}
              value={formatArray(values.typeOfServices)}
            />
          </>
        )}

        {/* Uploaded files */}
        {fileNames.length > 0 && (
          <div className="pt-2">
            <span className="block text-sm font-medium text-foreground">
              {/* ✅ FIX ICI */}
              {t("documents")}
            </span>
            <ul className="mt-1 list-disc list-inside text-sm text-muted-foreground">
              {fileNames.map((name, idx) => (
                <li key={idx}>{name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
