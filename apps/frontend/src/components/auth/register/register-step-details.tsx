"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { PillToggle } from "@/components/ui/pill-toggle";
import { FieldError } from "@/components/ui/field-error";
import { useZodForm } from "@/application/hooks/useZodForm";
import type { RegisterValues } from "@/lib/schemas/auth.schema";
import { registerFieldIds } from "@/domain/data/auth.data";
import {
  HANDICAP_TYPES,
  ACCOMMODATION_OPTIONS,
  EQUIPMENT_OPTIONS,
} from "@/domain/data/register.constants";
import type { AccountType } from "./register-form";

interface Props {
  accountType: AccountType;
  form: ReturnType<typeof useZodForm<RegisterValues>>;
}

function useToggleList(
  form: ReturnType<typeof useZodForm<RegisterValues>>,
  field: keyof RegisterValues,
) {
  const values = React.useMemo(
    () => (form.values[field] as string[]) ?? [],
    [form.values, field],
  );

  const toggle = React.useCallback(
    (item: string) => {
      form.setField(
        field,
        (values.includes(item)
          ? values.filter((x) => x !== item)
          : [...values, item]) as never,
      );
    },
    [form, field, values],
  );

  return { values, toggle };
}

function HandicappedDetails({
  form,
}: {
  form: ReturnType<typeof useZodForm<RegisterValues>>;
}) {
  const t = useTranslations("register");
  const tF = useTranslations("register.fields");
  const { values: accommodations, toggle: toggleAccommodation } = useToggleList(
    form,
    "requiredAccommodation",
  );

  const selectHandicapType = React.useCallback(
    (type: string) => {
      form.setField(
        "handicapType",
        (form.values.handicapType === type ? undefined : type) as never,
      );
    },
    [form],
  );

  return (
    <section aria-labelledby="step3-heading" className="space-y-5">
      <h2 id="step3-heading" className="sr-only">
        {t("steps.details")}
      </h2>

      <fieldset className="border-0 p-0 m-0 space-y-1.5" aria-required="true">
        <legend className="text-sm font-medium text-foreground">
          {tF("handicapType")}{" "}
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {HANDICAP_TYPES.map((h) => (
            <PillToggle
              key={h}
              label={h}
              selected={form.values.handicapType === h}
              onToggle={() => selectHandicapType(h)}
            />
          ))}
        </div>
        <FieldError message={form.errors.handicapType} />
      </fieldset>

      <fieldset className="border-0 p-0 m-0 space-y-1.5">
        <legend className="text-sm font-medium text-foreground">
          {tF("requiredAccommodation")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {ACCOMMODATION_OPTIONS.map((a) => (
            <PillToggle
              key={a}
              label={a}
              selected={accommodations.includes(a)}
              onToggle={() => toggleAccommodation(a)}
            />
          ))}
        </div>
        <FieldError message={form.errors.requiredAccommodation} />
      </fieldset>
    </section>
  );
}

function InstitutionDetails({
  form,
}: {
  form: ReturnType<typeof useZodForm<RegisterValues>>;
}) {
  const t = useTranslations("register");
  const tF = useTranslations("register.fields");
  const { values: equipment, toggle: toggleEquipment } = useToggleList(
    form,
    "specificEquipment",
  );

  return (
    <section aria-labelledby="step3-inst-heading" className="space-y-5">
      <h2 id="step3-inst-heading" className="sr-only">
        {t("steps.details")}
      </h2>

      <fieldset className="border-0 p-0 m-0 space-y-1.5" aria-required="true">
        <legend className="text-sm font-medium text-foreground">
          {tF("accessible")}{" "}
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        </legend>
        <div className="flex gap-6">
          {(
            [
              { val: true, labelKey: "accessibleYes" },
              { val: false, labelKey: "accessibleNo" },
            ] as const
          ).map(({ val, labelKey }) => (
            <label
              key={String(val)}
              className="flex items-center gap-2 cursor-pointer min-h-[44px]"
            >
              <input
                type="radio"
                name={registerFieldIds.accessible}
                value={String(val)}
                checked={
                  (form.values.accessible as boolean | undefined) === val
                }
                onChange={() => form.setField("accessible", val as never)}
                className="h-5 w-5 accent-primary"
              />
              <span className="text-sm text-foreground">{tF(labelKey)}</span>
            </label>
          ))}
        </div>
        <FieldError
          id={`${registerFieldIds.accessible}-error`}
          message={form.errors.accessible}
        />
      </fieldset>

      <fieldset className="border-0 p-0 m-0 space-y-1.5">
        <legend className="text-sm font-medium text-foreground">
          {tF("specificEquipment")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_OPTIONS.map((eq) => (
            <PillToggle
              key={eq}
              label={eq}
              selected={equipment.includes(eq)}
              onToggle={() => toggleEquipment(eq)}
            />
          ))}
        </div>
      </fieldset>
    </section>
  );
}

export function RegisterStepDetails({ accountType, form }: Props) {
  return accountType === "handicapped" ? (
    <HandicappedDetails form={form} />
  ) : (
    <InstitutionDetails form={form} />
  );
}
