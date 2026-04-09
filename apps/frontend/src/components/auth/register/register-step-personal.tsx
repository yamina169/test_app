"use client";

import * as React from "react";
import { FormField } from "@/components/form/field";
import type { RegisterValues } from "@/lib/schemas/auth.schema";
import { registerFieldIds } from "@/domain/data/auth.data";
import { OccupationStatus } from "@/domain/enums/user.enum";
import type { AccountType } from "./register-form";

const GOVERNORATES = [
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Nabeul",
  "Zaghouan",
  "Bizerte",
  "Béja",
  "Jendouba",
  "Kef",
  "Siliana",
  "Sousse",
  "Monastir",
  "Mahdia",
  "Sfax",
  "Kairouan",
  "Kasserine",
  "Sidi Bouzid",
  "Gabès",
  "Médenine",
  "Tataouine",
  "Gafsa",
  "Tozeur",
  "Kébili",
];

const SERVICE_OPTIONS = [
  "Santé",
  "Formation",
  "Aide financière",
  "Inclusion professionnelle",
  "Autres",
];

interface RegisterStepPersonalProps {
  accountType: AccountType;
  form: ReturnType<
    typeof import("@/application/hooks/useZodForm").useZodForm<RegisterValues>
  >;
}

export function RegisterStepPersonal({
  accountType,
  form,
}: RegisterStepPersonalProps) {
  // ── Handicapped branch ───────────────────────────────────────────
  if (accountType === "handicapped") {
    return (
      <section aria-labelledby="step2-heading" className="space-y-4">
        <h2 id="step2-heading" className="sr-only">
          Informations personnelles
        </h2>

        <FormField
          id={registerFieldIds.fullName}
          label="Nom complet"
          name="fullName"
          type="text"
          required
          hint="Entrez votre nom complet"
          value={form.values.fullName ?? ""}
          onChange={(v) => form.setField("fullName", v)}
          error={form.errors.fullName}
        />

        <FormField
          id={registerFieldIds.handicapCardId}
          label="Numéro de carte d'handicap"
          name="handicapCardId"
          type="text"
          hint="Entrez le numéro de votre carte d'handicap"
          value={form.values.handicapCardId ?? ""}
          onChange={(v) => form.setField("handicapCardId", v)}
          error={form.errors.handicapCardId}
        />

        <FormField
          id={registerFieldIds.phone}
          label="Téléphone"
          name="phone"
          type="tel"
          required
          hint="Format : +21612345678"
          value={form.values.phone ?? ""}
          onChange={(v) => form.setField("phone", v)}
          error={form.errors.phone}
        />

        <FormField
          id={registerFieldIds.email}
          label="Email"
          name="email"
          type="email"
          required
          hint="Entrez votre email"
          value={form.values.email ?? ""}
          onChange={(v) => form.setField("email", v)}
          error={form.errors.email}
        />

        <FormField
          id={registerFieldIds.password}
          label="Mot de passe"
          name="password"
          type="password"
          required
          hint="Minimum 8 caractères"
          value={form.values.password ?? ""}
          onChange={(v) => form.setField("password", v)}
          error={form.errors.password}
        />

        <FormField
          id={registerFieldIds.dateOfBirth}
          label="Date de naissance"
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

        {/* Gouvernorat */}
        <div className="space-y-1.5">
          <label
            htmlFor={registerFieldIds.governorate}
            className="block text-sm font-medium text-foreground"
          >
            Gouvernorat <span className="text-destructive">*</span>
          </label>
          <select
            id={registerFieldIds.governorate}
            name="governorate"
            required
            aria-invalid={!!form.errors.governorate}
            value={form.values.governorate ?? ""}
            onChange={(e) => form.setField("governorate", e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Sélectionnez votre gouvernorat</option>
            {GOVERNORATES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          {form.errors.governorate && (
            <p className="text-sm text-destructive">
              {form.errors.governorate}
            </p>
          )}
        </div>

        <FormField
          id={registerFieldIds.city}
          label="Ville"
          name="city"
          type="text"
          required
          hint="Entrez votre ville"
          value={form.values.city ?? ""}
          onChange={(v) => form.setField("city", v)}
          error={form.errors.city}
        />

        {/* Statut d'occupation */}
        <div className="space-y-1.5">
          <label
            htmlFor={registerFieldIds.occupationStatus}
            className="block text-sm font-medium text-foreground"
          >
            Situation professionnelle
          </label>
          <select
            id={registerFieldIds.occupationStatus}
            name="occupationStatus"
            aria-invalid={!!form.errors.occupationStatus}
            value={form.values.occupationStatus ?? ""}
            onChange={(e) =>
              form.setField(
                "occupationStatus",
                (e.target.value ||
                  undefined) as RegisterValues["occupationStatus"],
              )
            }
            className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Sélectionnez votre situation</option>
            {Object.values(OccupationStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {form.errors.occupationStatus && (
            <p className="text-sm text-destructive">
              {form.errors.occupationStatus}
            </p>
          )}
        </div>

        {/* Aidant / Tuteur */}
        <fieldset className="border-0 p-0 m-0 space-y-1.5">
          <legend className="text-sm font-medium text-foreground">
            Êtes-vous un aidant / tuteur ?
          </legend>
          <div className="flex gap-6">
            {[
              { val: true, label: "Oui, je suis aidant / tuteur" },
              { val: false, label: "Non,  pour moi-meme" },
            ].map(({ val, label }) => (
              <label
                key={String(val)}
                className="flex items-center gap-2 cursor-pointer min-h-[44px]"
              >
                <input
                  type="radio"
                  name={registerFieldIds.caregiver}
                  value={String(val)}
                  checked={
                    (form.values.caregiver as boolean | undefined) === val
                  }
                  onChange={() =>
                    form.setField(
                      "caregiver",
                      val as RegisterValues["caregiver"],
                    )
                  }
                  className="h-5 w-5 accent-primary"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>
          {form.errors.caregiver && (
            <p className="text-sm text-destructive">{form.errors.caregiver}</p>
          )}
        </fieldset>
      </section>
    );
  }

  // ── Institution branch ───────────────────────────────────────────
  return (
    <section aria-labelledby="step2-inst-heading" className="space-y-4">
      <h2 id="step2-inst-heading" className="sr-only">
        Informations de linstitution
      </h2>

      {/* Account holder personal info */}
      <FormField
        id={registerFieldIds.fullName}
        label="Nom du responsable"
        name="fullName"
        type="text"
        required
        hint="Nom complet du responsable du compte"
        value={form.values.fullName ?? ""}
        onChange={(v) => form.setField("fullName", v)}
        error={form.errors.fullName}
      />

      <FormField
        id={registerFieldIds.phone}
        label="Téléphone du responsable"
        name="phone"
        type="tel"
        required
        hint="Format : +21612345678"
        value={form.values.phone ?? ""}
        onChange={(v) => form.setField("phone", v)}
        error={form.errors.phone}
      />

      <FormField
        id={registerFieldIds.email}
        label="Email du responsable"
        name="email"
        type="email"
        required
        hint="Email utilisé pour se connecter"
        value={form.values.email ?? ""}
        onChange={(v) => form.setField("email", v)}
        error={form.errors.email}
      />

      <FormField
        id={registerFieldIds.password}
        label="Mot de passe"
        name="password"
        type="password"
        required
        hint="Minimum 8 caractères"
        value={form.values.password ?? ""}
        onChange={(v) => form.setField("password", v)}
        error={form.errors.password}
      />

      {/* Institution details */}
      <FormField
        id={registerFieldIds.institutionName}
        label="Nom de l'institution"
        name="institutionName"
        type="text"
        required
        hint="Nom officiel de l'institution"
        value={form.values.institutionName ?? ""}
        onChange={(v) => form.setField("institutionName", v)}
        error={form.errors.institutionName}
      />

      <FormField
        id={registerFieldIds.institutionPhone}
        label="Téléphone de l'institution"
        name="institutionPhone"
        type="tel"
        hint="Format : +21612345678"
        value={form.values.institutionPhone ?? ""}
        onChange={(v) => form.setField("institutionPhone", v)}
        error={form.errors.institutionPhone}
      />

      <FormField
        id={registerFieldIds.institutionEmail}
        label="Email de l'institution"
        name="institutionEmail"
        type="email"
        hint="Email public de l'institution"
        value={form.values.institutionEmail ?? ""}
        onChange={(v) => form.setField("institutionEmail", v)}
        error={form.errors.institutionEmail}
      />

      {/* Institution governorate */}
      <div className="space-y-1.5">
        <label
          htmlFor={registerFieldIds.institutionGovernorate}
          className="block text-sm font-medium text-foreground"
        >
          Gouvernorat <span className="text-destructive">*</span>
        </label>
        <select
          id={registerFieldIds.institutionGovernorate}
          name="institutionGovernorate"
          aria-invalid={!!form.errors.institutionGovernorate}
          value={form.values.institutionGovernorate ?? ""}
          onChange={(e) =>
            form.setField("institutionGovernorate", e.target.value)
          }
          className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Sélectionnez le gouvernorat</option>
          {GOVERNORATES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        {form.errors.institutionGovernorate && (
          <p className="text-sm text-destructive">
            {form.errors.institutionGovernorate}
          </p>
        )}
      </div>

      <FormField
        id={registerFieldIds.institutionCity}
        label="Ville"
        name="institutionCity"
        type="text"
        hint="Ville de l'institution"
        value={form.values.institutionCity ?? ""}
        onChange={(v) => form.setField("institutionCity", v)}
        error={form.errors.institutionCity}
      />

      <FormField
        id={registerFieldIds.website}
        label="Site web"
        name="website"
        type="url"
        hint="https://example.com"
        value={form.values.website ?? ""}
        onChange={(v) => form.setField("website", v)}
        error={form.errors.website}
      />

      {/* Services proposés */}
      <div className="space-y-1.5">
        <label
          htmlFor={registerFieldIds.typeOfServices}
          className="block text-sm font-medium text-foreground"
        >
          Services proposés <span className="text-destructive">*</span>
        </label>
        <select
          id={registerFieldIds.typeOfServices}
          name="typeOfServices"
          multiple
          aria-invalid={!!form.errors.typeOfServices}
          value={(form.values.typeOfServices as string[]) ?? []}
          onChange={(e) => {
            const selected = Array.from(
              e.target.selectedOptions,
              (o) => o.value,
            );
            form.setField("typeOfServices", selected);
          }}
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
        {form.errors.typeOfServices && (
          <p className="text-sm text-destructive">
            {form.errors.typeOfServices}
          </p>
        )}
      </div>
    </section>
  );
}
