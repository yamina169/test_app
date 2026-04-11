"use client";

import * as React from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form/field";
import {
  useResetPassword,
  useRequestPasswordReset,
} from "@/application/hooks/useAuth";

interface Props {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function OtpPasswordForm({ email, onBack, onSuccess }: Props) {
  const t = useTranslations("resetPassword");
  const locale = useLocale();

  const { submit, isPending, error, success } = useResetPassword();
  const { submit: resend, isPending: isResending } = useRequestPasswordReset();

  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const refs = React.useMemo(
    () => Array.from({ length: 6 }, () => React.createRef<HTMLInputElement>()),
    [],
  );

  const otpValue = otp.join("");
  const otpComplete = otpValue.length === 6;

  React.useEffect(() => {
    if (error) {
      setOtp(["", "", "", "", "", ""]);
      refs[0].current?.focus();
    }
  }, [error, refs]);

  React.useEffect(() => {
    if (success) {
      toast.success(t("toast.passwordChanged"), {
        description: t("toast.passwordChangedDescription"),
      });
      const timer = setTimeout(() => onSuccess(), 100);
      return () => clearTimeout(timer);
    }
  }, [success, t, onSuccess]);

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) refs[index + 1].current?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      refs[index - 1].current?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const next = [...otp];
    digits.split("").forEach((d, i) => {
      next[i] = d;
    });
    setOtp(next);
    refs[Math.min(digits.length, 5)].current?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (!otpComplete) return;
    if (!newPassword) return setLocalError(t("errors.passwordRequired"));
    if (newPassword !== confirmPassword)
      return setLocalError(t("errors.passwordMismatch"));
    await submit({ email, code: otpValue, newPassword });
  }

  async function handleResend() {
    await resend(email, locale);
    toast.info(t("toast.codeSent"));
  }

  const displayError = localError || error;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-6 space-y-6"
      aria-label={t("stepConfirm.formAriaLabel")}
    >
      <p className="text-sm text-center text-muted-foreground">
        {t("stepConfirm.subtitleShort")}
      </p>

      <div
        className="flex justify-center gap-3"
        role="group"
        aria-label={t("fields.otpAriaLabel")}
      >
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={refs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            aria-label={t("fields.otpDigit", { index: i + 1 })}
            className="h-14 w-12 rounded-xl border border-input bg-background text-center text-xl font-bold shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          />
        ))}
      </div>

      {otpComplete && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative space-y-1.5">
            <FormField
              id="newPassword"
              label={t("fields.newPassword")}
              name="newPassword"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={setNewPassword}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute end-1 top-7 h-10 w-10 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword
                  ? t("fields.hidePassword")
                  : t("fields.showPassword")
              }
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="relative space-y-1.5">
            <FormField
              id="confirmPassword"
              label={t("fields.confirmPassword")}
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute end-1 top-7 h-10 w-10 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={
                showConfirm
                  ? t("fields.hidePassword")
                  : t("fields.showPassword")
              }
              aria-pressed={showConfirm}
            >
              {showConfirm ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      )}

      {displayError && (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive text-center"
        >
          {displayError}
        </p>
      )}

      <Button
        type="submit"
        className="w-full h-12 rounded-xl text-base font-medium"
        disabled={!otpComplete || isPending}
        aria-busy={isPending}
      >
        {isPending ? t("actions.confirming") : t("actions.confirm")}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {t("actions.backToEmail")}
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="text-primary hover:underline disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {isResending ? t("actions.sending") : t("actions.resend")}
        </button>
      </div>
    </form>
  );
}
