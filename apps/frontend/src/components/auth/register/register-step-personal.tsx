"use client";

import { useTranslations } from "next-intl";
import { FormField } from "@/components/form/field";
import { SelectField } from "@/components/ui/select-field";
import { useZodForm } from "@/application/hooks/useZodForm";
import type { RegisterValues } from "@/lib/schemas/auth.schema";
import { registerFieldIds } from "@/domain/data/auth.data";
import { OccupationStatus } from "@/domain/enums/user.enum";
import {
  GOVERNORATES,
  SERVICE_OPTIONS,
} from "@/domain/data/register.constants";
import type { AccountType } from "./register-form";

interface Props {
  accountType: AccountType;
  form: ReturnType<typeof useZodForm<RegisterValues>>;
}

function GovernorateSelect({
  id,
  label,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const t = useTranslations("register.fields");
  return (
    <SelectField id={id} label={label} required error={error}>
      <select
        id={id}
        name={id}
        required
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">{t("governoratePlaceholder")}</option>
        {GOVERNORATES.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
    </SelectField>
  );
}

function HandicappedPersonalFields({
  form,
}: {
  form: ReturnType<typeof useZodForm<RegisterValues>>;
}) {
  const t = useTranslations("register");
  const tF = useTranslations("register.fields");

  const field = (
    name: keyof RegisterValues,
    label: string,
    type = "text",
    extra?: object,
  ) => (
    <FormField
      id={registerFieldIds[name as keyof typeof registerFieldIds]}
      label={label}
      name={name}
      type={type}
      required
      value={(form.values[name] ?? "") as string}
      onChange={(v) => form.setField(name, v as never)}
      error={form.errors[name]}
      {...extra}
    />
  );

  return (
    <section aria-labelledby="step2-heading" className="space-y-4">
      <h2 id="step2-heading" className="sr-only">
        {t("steps.personalInfo")}
      </h2>

      {field("fullName", tF("fullName"), "text", {
        hint: tF("fullNamePlaceholder"),
      })}

      <FormField
        id={registerFieldIds.handicapCardId}
        label={tF("cardNumber")}
        name="handicapCardId"
        type="text"
        hint={tF("cardNumberPlaceholder")}
        value={(form.values.handicapCardId ?? "") as string}
        onChange={(v) => form.setField("handicapCardId", v as never)}
        error={form.errors.handicapCardId}
      />

      {field("phone", tF("phone"), "tel", { hint: tF("phonePlaceholder") })}
      {field("email", tF("email"), "email", { hint: tF("emailPlaceholder") })}
      {field("password", tF("password"), "password", {
        hint: tF("passwordPlaceholder"),
      })}

      <FormField
        id={registerFieldIds.dateOfBirth}
        label={tF("dateOfBirth")}
        name="dateOfBirth"
        type="date"
        required
        value={
          form.values.dateOfBirth
            ? (form.values.dateOfBirth as Date).toISOString().split("T")[0]
            : ""
        }
        onChange={(v) =>
          form.setField("dateOfBirth", v ? new Date(v) : undefined)
        }
        error={form.errors.dateOfBirth}
      />

      <GovernorateSelect
        id={registerFieldIds.governorate}
        label={tF("governorate")}
        value={(form.values.governorate ?? "") as string}
        error={form.errors.governorate}
        onChange={(v) => form.setField("governorate", v as never)}
      />

      {field("city", tF("city"), "text", { hint: tF("cityPlaceholder") })}

      <SelectField
        id={registerFieldIds.occupationStatus}
        label={tF("typeOfServices")}
        error={form.errors.occupationStatus}
      >
        <select
          id={registerFieldIds.occupationStatus}
          name="occupationStatus"
          aria-invalid={!!form.errors.occupationStatus}
          value={(form.values.occupationStatus ?? "") as string}
          onChange={(e) =>
            form.setField(
              "occupationStatus",
              (e.target.value || undefined) as never,
            )
          }
          className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value=""></option>
          {Object.values(OccupationStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </SelectField>

      <fieldset className="border-0 p-0 m-0 space-y-1.5">
        <legend className="text-sm font-medium text-foreground">
          {tF("caregiver")}
        </legend>
        <div className="flex gap-6">
          {(
            [
              { val: true, labelKey: "caregiverOther" },
              { val: false, labelKey: "caregiverSelf" },
            ] as const
          ).map(({ val, labelKey }) => (
            <label
              key={String(val)}
              className="flex items-center gap-2 cursor-pointer min-h-[44px]"
            >
              <input
                type="radio"
                name={registerFieldIds.caregiver}
                value={String(val)}
                checked={(form.values.caregiver as boolean | undefined) === val}
                onChange={() => form.setField("caregiver", val as never)}
                className="h-5 w-5 accent-primary"
              />
              <span className="text-sm text-foreground">{tF(labelKey)}</span>
            </label>
          ))}
        </div>
        {form.errors.caregiver && (
          <p
            id={`${registerFieldIds.caregiver}-error`}
            role="alert"
            className="text-sm text-destructive"
          >
            {form.errors.caregiver}
          </p>
        )}
      </fieldset>
    </section>
  );
}

function InstitutionPersonalFields({
  form,
}: {
  form: ReturnType<typeof useZodForm<RegisterValues>>;
}) {
  const t = useTranslations("register");
  const tF = useTranslations("register.fields");

  const field = (
    name: keyof RegisterValues,
    label: string,
    type = "text",
    opts?: { hint?: string; required?: boolean },
  ) => (
    <FormField
      id={registerFieldIds[name as keyof typeof registerFieldIds]}
      label={label}
      name={name}
      type={type}
      required={opts?.required}
      hint={opts?.hint}
      value={(form.values[name] ?? "") as string}
      onChange={(v) => form.setField(name, v as never)}
      error={form.errors[name]}
    />
  );

  return (
    <section aria-labelledby="step2-inst-heading" className="space-y-4">
      <h2 id="step2-inst-heading" className="sr-only">
        {t("steps.personalInfo")}
      </h2>

      {field("fullName", tF("fullName"), "text", {
        required: true,
        hint: tF("fullNamePlaceholder"),
      })}
      {field("phone", tF("phone"), "tel", {
        required: true,
        hint: tF("phonePlaceholder"),
      })}
      {field("email", tF("email"), "email", {
        required: true,
        hint: tF("emailPlaceholder"),
      })}
      {field("password", tF("password"), "password", {
        required: true,
        hint: tF("passwordPlaceholder"),
      })}
      {field("institutionName", tF("institutionName"), "text", {
        required: true,
        hint: tF("institutionNamePlaceholder"),
      })}
      {field("institutionPhone", tF("institutionPhone"), "tel", {
        hint: tF("phonePlaceholder"),
      })}
      {field("institutionEmail", tF("institutionEmail"), "email", {
        hint: tF("emailPlaceholder"),
      })}

      <GovernorateSelect
        id={registerFieldIds.institutionGovernorate}
        label={tF("institutionGovernorate")}
        value={(form.values.institutionGovernorate ?? "") as string}
        error={form.errors.institutionGovernorate}
        onChange={(v) => form.setField("institutionGovernorate", v as never)}
      />

      {field("institutionCity", tF("institutionCity"), "text", {
        hint: tF("cityPlaceholder"),
      })}
      {field("website", tF("website"), "url", {
        hint: tF("websitePlaceholder"),
      })}

      <SelectField
        id={registerFieldIds.typeOfServices}
        label={tF("typeOfServices")}
        required
        error={form.errors.typeOfServices}
      >
        <select
          id={registerFieldIds.typeOfServices}
          name="typeOfServices"
          multiple
          aria-multiselectable="true"
          aria-invalid={!!form.errors.typeOfServices}
          value={(form.values.typeOfServices as string[]) ?? []}
          onChange={(e) =>
            form.setField(
              "typeOfServices",
              Array.from(e.target.selectedOptions, (o) => o.value) as never,
            )
          }
          className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {SERVICE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Maintenez Ctrl (ou ⌘) pour sélectionner plusieurs services
        </p>
      </SelectField>
    </section>
  );
}

export function RegisterStepPersonal({ accountType, form }: Props) {
  return accountType === "handicapped" ? (
    <HandicappedPersonalFields form={form} />
  ) : (
    <InstitutionPersonalFields form={form} />
  );
}
