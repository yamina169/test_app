"use client";

import * as React from "react";
import { Mail, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";


const OTP_LENGTH = 6;


interface RegisterStepOtpProps {
  email: string;
  digits: string[];
  isLoading: boolean;
  onChangeDigits: React.Dispatch<React.SetStateAction<string[]>>;
  onConfirm: () => void;
  onResend: () => void;
}


export function RegisterStepOtp({
  email,
  digits,
  isLoading,
  onChangeDigits,
  onConfirm,
  onResend,
}: RegisterStepOtpProps) {
  const t = useTranslations("register.otp");
  const tActions = useTranslations("register.actions");

  const inputRefs = React.useRef<Array<HTMLInputElement | null>>(
    Array(OTP_LENGTH).fill(null),
  );

  React.useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const updateDigit = React.useCallback(
    (index: number, raw: string) => {
      const digit = raw.replace(/\D/g, "").slice(-1);
      onChangeDigits((prev) => {
        const next = [...prev];
        next[index] = digit;
        return next;
      });
      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [onChangeDigits],
  );

  const handleKeyDown = React.useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits],
  );

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, OTP_LENGTH);
      if (!pasted) return;
      e.preventDefault();
      const next = Array(OTP_LENGTH).fill("");
      pasted.split("").forEach((char, idx) => (next[idx] = char));
      onChangeDigits(next);
      inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    },
    [onChangeDigits],
  );

  const allFilled = digits.every((d) => d !== "");

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100"
        aria-hidden="true"
      >
        <Mail className="h-8 w-8 text-primary" />
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{t("title")}</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          {t("subtitle", { email })}
        </p>
      </div>

      <div
        role="group"
        aria-label={t("title")}
        className="grid grid-cols-6 gap-2 w-full max-w-xs"
      >
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            id={`otp-digit-${idx}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            aria-label={t("inputAriaLabel", { index: idx + 1 })}
            autoComplete={idx === 0 ? "one-time-code" : "off"}
            onChange={(e) => updateDigit(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={idx === 0 ? handlePaste : undefined}
            className={[
              "h-12 w-full rounded-xl border text-center text-lg font-semibold",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              digit
                ? "border-primary bg-primary/5"
                : "border-input bg-background",
            ].join(" ")}
          />
        ))}
      </div>

      <Button
        type="button"
        className="w-full max-w-xs h-12 rounded-xl text-base font-medium"
        disabled={!allFilled || isLoading}
        aria-busy={isLoading}
        onClick={onConfirm}
      >
        {isLoading ? tActions("submitting") : t("confirm")}
      </Button>

      <button
        type="button"
        onClick={onResend}
        disabled={isLoading}
        className="mx-auto flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded disabled:opacity-50"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        {t("resend")}
      </button>
    </div>
  );
}
