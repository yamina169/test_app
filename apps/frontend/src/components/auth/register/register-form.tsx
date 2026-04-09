"use client";

import * as React from "react";
import { z } from "zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useZodForm } from "@/application/hooks/useZodForm";
import { useAuth } from "@/application/hooks/useAuth";
import { mapZodErrors } from "@/lib/zod/mapZodErrors";
import { registerSchema, type RegisterValues } from "@/lib/schemas/auth.schema";
import { registerInitialValues } from "@/domain/data/auth.data";

import { RegisterStepAccountType } from "./register-step-account-type";
import { RegisterStepPersonal } from "./register-step-personal";
import { RegisterStepDetails } from "./register-step-details";
import { RegisterStepDocuments } from "./register-step-documents";
import { RegisterStepReview } from "./register-step-review";
import { RegisterStepOtp } from "./register-step-otp";

export type AccountType = "handicapped" | "institution";

export interface RegisterStepProps {
  form: ReturnType<typeof useZodForm<RegisterValues>>;
}

const TOTAL_STEPS = 5;
type OtpPhase = "idle" | "sending" | "waiting";

interface FileEntry {
  file: File;
  documentType: string;
}

// ── Per-step partial schemas ──────────────────────────────────────
const STEP_SCHEMAS: Partial<Record<number, z.ZodTypeAny>> = {
  1: registerSchema.pick({ roleId: true }),
  2: registerSchema.pick({
    fullName: true,
    email: true,
    phone: true,
    password: true,
  }),
};

// ── Progress bar ──────────────────────────────────────────────────
function ProgressBar({
  step,
  total,
  stepLabel,
  progressLabel,
}: {
  step: number;
  total: number;
  stepLabel: string;
  progressLabel: string;
}) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="mb-4" aria-label={progressLabel}>
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{stepLabel}</span>
        <span aria-hidden="true">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={progressLabel}
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export function RegisterForm() {
  const t = useTranslations("register");
  const tErrors = useTranslations("register.errors");
  const router = useRouter();

  const {
    register: registerUser,
    sendOtp,
    isLoading,
    error: authError,
  } = useAuth();

  const stepHeadingRef = React.useRef<HTMLHeadingElement | null>(null);

  const form = useZodForm<RegisterValues>({
    initialValues: registerInitialValues as RegisterValues,
    schema: registerSchema,
    t: (key) => tErrors(key.replace("errors.", "")),
  });

  const [step, setStep] = React.useState(1);
  const [submitted, setSubmitted] = React.useState(false);
  const [accountType, setAccountType] = React.useState<AccountType | null>(
    null,
  );
  const [otpPhase, setOtpPhase] = React.useState<OtpPhase>("idle");
  const [otpDigits, setOtpDigits] = React.useState<string[]>(Array(6).fill(""));
  const [files, setFiles] = React.useState<FileEntry[]>([]);
  const [caregiverFiles, setCaregiverFiles] = React.useState<FileEntry[]>([]);
  const [announcement, setAnnouncement] = React.useState("");

  const isOtpActive = step === 2 && otpPhase === "waiting";

  React.useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [step, otpPhase]);

  // ── Per-step partial validation ───────────────────────────────────
  function validateStep(currentStep: number): boolean {
    const stepSchema = STEP_SCHEMAS[currentStep];
    if (!stepSchema) return true;

    const result = stepSchema.safeParse(form.values);
    if (result.success) return true;

    const mapped = mapZodErrors<RegisterValues>(result.error as z.ZodError);
    const translated: Partial<Record<keyof RegisterValues, string>> = {};
    for (const [k, msgKey] of Object.entries(mapped)) {
      const key = k as keyof RegisterValues;
      translated[key] = msgKey
        ? tErrors(msgKey.replace("errors.", ""))
        : undefined;
    }
    form.setErrors(translated);
    return false;
  }

  // ── Account type card clicked ─────────────────────────────────────
  const handleAccountTypeChange = React.useCallback(
    (type: AccountType, roleId: number) => {
      setAccountType(type);
      form.setField("roleId", roleId as RegisterValues["roleId"]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ── Navigation ────────────────────────────────────────────────────
  async function goNext() {
    if (!validateStep(step)) return;

    if (step === 2 && otpPhase === "idle") {
      const email = (form.values.email as string) ?? "";
      setOtpPhase("sending");
      setAnnouncement(t("otp.sending"));

      const ok = await sendOtp({ email, locale: "fr" });

      if (ok) {
        setOtpDigits(Array(6).fill(""));
        setOtpPhase("waiting");
        setAnnouncement(t("otp.title"));
      } else {
        setOtpPhase("idle");
      }
      return;
    }

    if (step < TOTAL_STEPS) {
      const nextStep = step + 1;
      setStep(nextStep);
      setAnnouncement(
        t("stepLabel", { current: nextStep, total: TOTAL_STEPS }),
      );
    }
  }

  function goBack() {
    if (step === 2 && otpPhase === "waiting") {
      setOtpPhase("idle");
      return;
    }
    if (step > 1) {
      setStep(step - 1);
      setAnnouncement(
        t("stepLabel", { current: step - 1, total: TOTAL_STEPS }),
      );
    }
  }

  async function confirmOtp() {
    const code = otpDigits.join("");
    form.setField("otpCode", code as RegisterValues["otpCode"]);
    setStep(3);
    setOtpPhase("idle");
  }

  async function resendOtp() {
    const email = (form.values.email as string) ?? "";
    setOtpDigits(Array(6).fill(""));
    await sendOtp({ email, locale: "fr" });
  }

  // ── Final submit ──────────────────────────────────────────────────
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step !== TOTAL_STEPS) return; // ✅ bloque si pas sur l'étape review
    if (isLoading || submitted) return;

    const res = form.validate();
    if (!res.ok) return;

    const allFiles = [...files, ...caregiverFiles];
    const user = await registerUser(res.values, allFiles);

    if (user) {
      setSubmitted(true);
      router.push("/login");
    }
  }

  const stepLabels = [
    t("steps.accountType"),
    t("steps.personalInfo"),
    t("steps.details"),
    t("steps.documents"),
    t("steps.review"),
  ];

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col space-y-4">
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <h2 ref={stepHeadingRef} tabIndex={-1}>
        {isOtpActive ? t("otp.title") : stepLabels[step - 1]}
      </h2>

      {!isOtpActive && (
        <ProgressBar
          step={step}
          total={TOTAL_STEPS}
          stepLabel={t("stepLabel", { current: step, total: TOTAL_STEPS })}
          progressLabel={t("progressLabel", {
            percent: Math.round((step / TOTAL_STEPS) * 100),
          })}
        />
      )}

      {authError && (
        <p role="alert" className="text-sm text-red-500">
          {authError}
        </p>
      )}

      <div>
        {isOtpActive ? (
          <RegisterStepOtp
            email={(form.values.email as string) ?? ""}
            digits={otpDigits}
            isLoading={isLoading}
            onChangeDigits={setOtpDigits}
            onConfirm={confirmOtp}
            onResend={resendOtp}
          />
        ) : (
          <>
            {step === 1 && (
              <>
                <RegisterStepAccountType
                  value={accountType}
                  onChange={handleAccountTypeChange}
                />
                {form.errors.roleId && (
                  <p role="alert" className="mt-2 text-sm text-destructive">
                    {t("accountType.required")}
                  </p>
                )}
              </>
            )}
            {step === 2 && accountType && (
              <RegisterStepPersonal form={form} accountType={accountType} />
            )}
            {step === 3 && accountType && (
              <RegisterStepDetails form={form} accountType={accountType} />
            )}
            {step === 4 && accountType && (
              <RegisterStepDocuments
                accountType={accountType}
                files={files}
                caregiverFiles={caregiverFiles}
                showCaregiverSection={form.values.caregiver === true}
                onAddFiles={(e) => setFiles((p) => [...p, ...e])}
                onRemoveFile={(i) =>
                  setFiles((p) => p.filter((_, idx) => idx !== i))
                }
                onAddCaregiverFiles={(e) =>
                  setCaregiverFiles((p) => [...p, ...e])
                }
                onRemoveCaregiverFile={(i) =>
                  setCaregiverFiles((p) => p.filter((_, idx) => idx !== i))
                }
              />
            )}
            {step === 5 && accountType && (
              <RegisterStepReview
                accountType={accountType}
                values={form.values}
                fileNames={[
                  ...files.map((f) => f.file.name),
                  ...caregiverFiles.map((f) => f.file.name),
                ]}
              />
            )}
          </>
        )}
      </div>

      {!isOtpActive && (
        <div className="flex justify-between">
          <Button type="button" onClick={goBack} disabled={step === 1}>
            {t("actions.back")}
          </Button>

          {step < TOTAL_STEPS ? (
            <Button type="button" onClick={goNext} disabled={isLoading}>
              {isLoading ? "…" : t("actions.next")}
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading || submitted}
              aria-busy={isLoading}
            >
              {isLoading ? "…" : t("actions.submit")}
            </Button>
          )}
        </div>
      )}

      <div className="text-center">
        {t("links.backToLogin")}{" "}
        <Link href="/login">{t("links.loginLink")}</Link>
      </div>
    </form>
  );
}
