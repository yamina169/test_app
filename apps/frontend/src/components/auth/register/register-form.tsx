"use client";

import * as React from "react";
import { z } from "zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useZodForm } from "@/application/hooks/useZodForm";
import {
  useRegister,
  useSendVerificationEmail,
} from "@/application/hooks/useAuth";
import { mapZodErrors } from "@/lib/zod/mapZodErrors";
import { registerSchema, type RegisterValues } from "@/lib/schemas/auth.schema";
import { registerInitialValues } from "@/domain/data/auth.data";
import { TOTAL_STEPS } from "@/domain/data/register.constants";

import { RegisterStepAccountType } from "./register-step-account-type";
import { RegisterStepPersonal } from "./register-step-personal";
import { RegisterStepDetails } from "./register-step-details";
import {
  RegisterStepDocuments,
  type FileEntry,
} from "./register-step-documents";
import { RegisterStepReview } from "./register-step-review";
import { RegisterStepOtp } from "./register-step-otp";

export type AccountType = "handicapped" | "institution";

function getStepSchema(
  step: number,
  type: AccountType | null,
): z.ZodTypeAny | null {
  switch (step) {
    case 1:
      return registerSchema.pick({ roleId: true });
    case 2:
      return registerSchema.pick({
        fullName: true,
        email: true,
        phone: true,
        password: true,
      });
    case 3:
      if (type === "handicapped") {
        return z.object({
          handicapType: z.string().min(1, { message: "errors.required" }),
        });
      }
      if (type === "institution") {
        return z.object({
          accessible: z.boolean().refine((v) => v === true || v === false, {
            message: "errors.required",
          }),
        });
      }
      return null;
    default:
      return null;
  }
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);

  return (
    <div className="mb-4">
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function RegisterForm() {
  const t = useTranslations("register");
  const tErrors = useTranslations("register.errors");
  const tToast = useTranslations("register.toast");
  const router = useRouter();

  const {
    submit: registerUser,
    isPending: isLoading,
    error: authError,
  } = useRegister();

  const { submit: sendOtp } = useSendVerificationEmail();

  const form = useZodForm<RegisterValues>({
    initialValues: registerInitialValues as RegisterValues,
    schema: registerSchema,
    t: (key) => tErrors(key.replace("errors.", "")),
  });

  const [step, setStep] = React.useState(1);
  const [accountType, setAccountType] = React.useState<AccountType | null>(
    null,
  );
  const [otpDigits, setOtpDigits] = React.useState<string[]>(Array(6).fill(""));
  const [files, setFiles] = React.useState<FileEntry[]>([]);
  const [caregiverFiles, setCaregiverFiles] = React.useState<FileEntry[]>([]);

  const isOtpStep = step === TOTAL_STEPS;

  const validateStep = React.useCallback(
    (currentStep: number) => {
      const schema = getStepSchema(currentStep, accountType);
      if (!schema) return true;

      const result = schema.safeParse(form.values);
      if (result.success) return true;

      const mapped = mapZodErrors<RegisterValues>(result.error);
      const translated: Partial<Record<keyof RegisterValues, string>> = {};

      for (const [k, msgKey] of Object.entries(mapped)) {
        if (msgKey) {
          translated[k as keyof RegisterValues] = tErrors(
            msgKey.replace("errors.", ""),
          );
        }
      }

      form.setErrors(translated);
      return false;
    },
    [form, accountType, tErrors],
  );

  const goNext = async () => {
    if (!validateStep(step)) return;

    if (step === 4 && files.length === 0) {
      toast.error(tErrors("required"));
      return;
    }

    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSendOtp = React.useCallback(async () => {
    await sendOtp(form.values.email as string, "fr");

    toast.success(t("otp.sending"), {
      description: t("otp.subtitle", { email: form.values.email }),
    });
  }, [sendOtp, form.values.email, t]);

  React.useEffect(() => {
    if (isOtpStep) handleSendOtp();
  }, [isOtpStep, handleSendOtp]);

  const confirmOtp = async () => {
    try {
      const code = otpDigits.join("");
      form.setField("otpCode", code as unknown as RegisterValues["otpCode"]);

      const res = form.validate();
      if (!res.ok) return;

      const cleaned = Object.fromEntries(
        Object.entries(res.values).filter(([, v]) => {
          if (typeof v === "string") return v.trim() !== "";
          if (Array.isArray(v)) return v.length > 0;
          return v !== undefined && v !== null;
        }),
      ) as RegisterValues;

      const allFiles = [...files, ...caregiverFiles].map((entry) => ({
        field: entry.documentType,
        file: entry.file,
      }));

      await registerUser(
        cleaned,
        allFiles,
        allFiles.map((f) => f.field),
      );

      if (authError) {
        toast.error(authError || t("errors.summaryTitle"));
        return;
      }

      toast.success(tToast("success"), {
        description: tToast("successDescription"),
      });

      router.push("/login");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t("errors.summaryTitle") || "Registration failed";

      toast.error(message);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpStep) goNext();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2>{t("title")}</h2>

      {!isOtpStep && <ProgressBar step={step} total={TOTAL_STEPS} />}

      {authError && <p className="text-red-500">{authError}</p>}

      <div>
        {isOtpStep ? (
          <RegisterStepOtp
            email={form.values.email as string}
            digits={otpDigits}
            onChangeDigits={setOtpDigits}
            onConfirm={confirmOtp}
            onResend={handleSendOtp}
            isLoading={isLoading}
          />
        ) : (
          <>
            {step === 1 && (
              <RegisterStepAccountType
                value={accountType}
                onChange={(type, roleId) => {
                  setAccountType(type);
                  form.setField(
                    "roleId",
                    roleId as unknown as RegisterValues["roleId"],
                  );
                }}
              />
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
                onAddFiles={(f) => setFiles((p) => [...p, ...f])}
                onRemoveFile={(i) =>
                  setFiles((p) => p.filter((_, idx) => idx !== i))
                }
                onAddCaregiverFiles={(f) =>
                  setCaregiverFiles((p) => [...p, ...f])
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

      {!isOtpStep && (
        <div className="flex justify-between">
          {step > 1 ? (
            <Button
              type="button"
              onClick={goBack}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              {t("actions.back")}
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {step < TOTAL_STEPS - 1 ? t("actions.next") : t("actions.submit")}
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="text-center mt-4">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            {t("links.loginLink")}
          </Link>
        </div>
      )}
    </form>
  );
}
