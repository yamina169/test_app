"use client";

import { useTranslations } from "next-intl";
import type { RegisterValues } from "@/lib/schemas/auth.schema";
import { registerFieldIds } from "@/domain/data/auth.data";
import type { AccountType, RegisterStepProps } from "./register-form";

const HANDICAP_TYPES = [
  "Motor",
  "Visual",
  "Auditory",
  "Cognitive",
  "Psychosocial",
  "Multiple",
  "Other",
];

const ACCOMMODATION_OPTIONS = [
  "Fauteuil roulant",
  "Langue des signes",
  "Braille",
  "Screen Reader",
  "Descriptions audio",
  "Lecture facile",
  "Assistant personnel",
];

const EQUIPMENT_OPTIONS = [
  "Rampe",
  "Signalétique Braille",
  "Ascenseur accessible",
  "Salle sensorielle",
  "Support audio/visuel",
];

// ── Pill toggle (multi-select) ────────────────────────────────────
interface PillToggleProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

function PillToggle({ label, selected, onToggle }: PillToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={[
        "rounded-full border px-4 py-2 text-sm min-h-[44px] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/10 text-primary font-medium"
          : "border-border text-muted-foreground hover:border-primary/40",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

interface RegisterStepDetailsProps extends RegisterStepProps {
  accountType: AccountType;
}

export function RegisterStepDetails({
  form,
  accountType,
}: RegisterStepDetailsProps) {
  const t = useTranslations("register");

  // ── Helpers ───────────────────────────────────────────────────────

  /** Toggle an item inside an array field (multi-select). */
  function toggleArrayField<K extends keyof RegisterValues>(
    key: K,
    item: string,
  ) {
    const current = (form.values[key] as string[]) ?? [];
    const next = current.includes(item)
      ? current.filter((x) => x !== item)
      : [...current, item];
    form.setField(key, next as RegisterValues[K]);
  }

  /**
   * Single-select for handicapType:
   * clicking the already-selected value deselects it (sets undefined).
   */
  function selectHandicapType(type: string) {
    const current = form.values.handicapType as string | undefined;
    form.setField(
      "handicapType",
      current === type ? undefined : (type as RegisterValues["handicapType"]),
    );
  }

  // ── Handicap branch ───────────────────────────────────────────────
  if (accountType === "handicapped") {
    return (
      <section aria-labelledby="step3-heading" className="space-y-5">
        <h2 id="step3-heading" className="sr-only">
          {t("steps.details")}
        </h2>

        {/* Handicap type — SINGLE select (maps to handicapType: string) */}
        <fieldset className="border-0 p-0 m-0 space-y-1.5" aria-required="true">
          <legend className="text-sm font-medium text-foreground">
            {t("fields.handicapType")}{" "}
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
          {form.errors.handicapType && (
            <p role="alert" className="text-sm text-destructive">
              {form.errors.handicapType}
            </p>
          )}
        </fieldset>

        {/* Required accommodations — MULTI select (maps to requiredAccommodation: string[]) */}
        <fieldset className="border-0 p-0 m-0 space-y-1.5">
          <legend className="text-sm font-medium text-foreground">
            {t("fields.requiredAccommodation")}
          </legend>
          <div className="flex flex-wrap gap-2">
            {ACCOMMODATION_OPTIONS.map((a) => (
              <PillToggle
                key={a}
                label={a}
                selected={(
                  (form.values.requiredAccommodation as string[]) ?? []
                ).includes(a)}
                onToggle={() => toggleArrayField("requiredAccommodation", a)}
              />
            ))}
          </div>
          {form.errors.requiredAccommodation && (
            <p role="alert" className="text-sm text-destructive">
              {form.errors.requiredAccommodation}
            </p>
          )}
        </fieldset>
      </section>
    );
  }

  // ── Institution branch ─────────────────────────────────────────────
  return (
    <section aria-labelledby="step3-inst-heading" className="space-y-5">
      <h2 id="step3-inst-heading" className="sr-only">
        {t("steps.details")}
      </h2>

      {/* Accessible radio */}
      <fieldset className="border-0 p-0 m-0 space-y-1.5" aria-required="true">
        <legend className="text-sm font-medium text-foreground">
          {t("fields.accessible")}{" "}
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        </legend>
        <div className="flex gap-6">
          {[
            { val: true, label: t("fields.accessibleYes") },
            { val: false, label: t("fields.accessibleNo") },
          ].map(({ val, label }) => (
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
                onChange={() =>
                  form.setField(
                    "accessible",
                    val as RegisterValues["accessible"],
                  )
                }
                aria-describedby={
                  form.errors.accessible
                    ? `${registerFieldIds.accessible}-error`
                    : undefined
                }
                className="h-5 w-5 accent-primary"
              />
              <span className="text-sm text-foreground">{label}</span>
            </label>
          ))}
        </div>
        {form.errors.accessible && (
          <p
            id={`${registerFieldIds.accessible}-error`}
            role="alert"
            className="text-sm text-destructive"
          >
            {form.errors.accessible}
          </p>
        )}
      </fieldset>

      {/* Equipment pills — MULTI select (maps to specificEquipment: string[]) */}
      <fieldset className="border-0 p-0 m-0 space-y-1.5">
        <legend className="text-sm font-medium text-foreground">
          {t("fields.specificEquipment")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_OPTIONS.map((eq) => (
            <PillToggle
              key={eq}
              label={eq}
              selected={(
                (form.values.specificEquipment as string[]) ?? []
              ).includes(eq)}
              onToggle={() => toggleArrayField("specificEquipment", eq)}
            />
          ))}
        </div>
      </fieldset>
    </section>
  );
}
