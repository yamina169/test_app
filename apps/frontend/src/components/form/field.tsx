"use client";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Props = {
  id?: string;
  label: string;
  name: string;
  type?: React.HTMLInputTypeAttribute;
  required?: boolean;
  error?: string;
  textarea?: boolean;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
};

export function FormField({
  id,
  label,
  name,
  type = "text",
  required,
  error,
  textarea,
  autoComplete,
  value,
  onChange,
  hint,
}: Props) {
  const uid = React.useId();
  const inputId = id ?? `field-${name}-${uid}`;
  const errId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const describedBy =
    [hint ? hintId : null, error ? errId : null].filter(Boolean).join(" ") ||
    undefined;

  const t = useTranslations("common");

  return (
    <div className="flex flex-col gap-2">
      {/* Label */}
      <Label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
        {required && (
          <>
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> ({t("required")})</span>
          </>
        )}
      </Label>

      {/* Hint */}
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}

      {/* Input / Textarea */}
      {textarea ? (
        <Textarea
          id={inputId}
          name={name}
          rows={5}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          aria-errormessage={error ? errId : undefined}
          className={cn(
            "bg-card text-foreground placeholder:text-muted-foreground border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
            error
              ? "border-destructive focus:ring-destructive"
              : "border-border",
          )}
        />
      ) : (
        <Input
          id={inputId}
          name={name}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          aria-errormessage={error ? errId : undefined}
          className={cn(
            "bg-card text-foreground placeholder:text-muted-foreground border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
            error
              ? "border-destructive focus:ring-destructive"
              : "border-border",
          )}
        />
      )}

      {/* Error message */}
      {error && (
        <p
          id={errId}
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
