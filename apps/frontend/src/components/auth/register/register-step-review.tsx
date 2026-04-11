"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { RegisterValues } from "@/lib/schemas/auth.schema";
import type { AccountType } from "./register-form";

interface Props {
  accountType: AccountType;
  values: Partial<RegisterValues>;
  fileNames: string[];
}

function formatDate(d?: Date) {
  return d?.toLocaleDateString("fr-TN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatArray(arr?: string[]) {
  return arr?.length ? arr.join(", ") : undefined;
}

const ReviewRow = React.memo(function ReviewRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-6">
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-right text-muted-foreground">{value}</span>
    </div>
  );
});

export function RegisterStepReview({ accountType, values, fileNames }: Props) {
  const t = useTranslations("register.review");
  const tF = useTranslations("register.fields");
  const isHandicap = accountType === "handicapped";

  const caregiverLabel =
    values.caregiver === true
      ? tF("caregiverOther")
      : values.caregiver === false
        ? tF("caregiverSelf")
        : undefined;

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
            <ReviewRow label={t("cardNumber")} value={values.handicapCardId} />
            <ReviewRow label={t("phone")} value={values.phone} />
            <ReviewRow label={t("email")} value={values.email} />
            <ReviewRow
              label={t("dateOfBirth")}
              value={formatDate(values.dateOfBirth)}
            />
            <ReviewRow label={t("governorate")} value={values.governorate} />
            <ReviewRow label={t("city")} value={values.city} />
            <ReviewRow label={t("caregiver")} value={caregiverLabel} />
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
            <ReviewRow
              label={t("services")}
              value={formatArray(values.typeOfServices)}
            />
            <ReviewRow
              label={t("accessible")}
              value={
                values.accessible === true
                  ? tF("accessibleYes")
                  : values.accessible === false
                    ? tF("accessibleNo")
                    : undefined
              }
            />
            <ReviewRow
              label={t("equipment")}
              value={formatArray(values.specificEquipment)}
            />
          </>
        )}

        {fileNames.length > 0 && (
          <div className="pt-2">
            <span className="block text-sm font-medium text-foreground">
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
