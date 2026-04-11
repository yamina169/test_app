// Each form should contain this component as a it's required by WCAG
// WCAG 3.3.1 Error Identification: summary
"use client";

import * as React from "react";

type ErrorSummaryProps<T extends Record<string, unknown>> = {
    title: string;
    errors: Partial<Record<keyof T, string>>;
    // WCAG 3.3.1 + 2.4.3: focus target after failed submit (programmatic focus)
    summaryRef: React.RefObject<HTMLDivElement | null>;
    // click handler to focus a field
    onFocusField: (key: keyof T) => void;
};

export function ErrorSummary<T extends Record<string, unknown>>({
    title,
    errors,
    summaryRef,
    onFocusField,
}: ErrorSummaryProps<T>) {
    const entries = (Object.entries(errors) as Array<[keyof T, string | undefined]>).filter(
        ([, msg]) => Boolean(msg)
    );

    if (entries.length === 0) return null;

    return (
        <div
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            aria-live="assertive"
            // WCAG 1.4.1 Use of Color: errors are not indicated by color alone (text + list).
            // WCAG 1.4.3 Contrast
            className="rounded-lg border border-destructive bg-background p-4 text-sm text-foreground"
        >
            <p className="font-semibold">{title}</p>

            <ul className="mt-2 list-disc pl-5">
                {entries.map(([key, msg]) => (
                    <li key={String(key)}>
                        <button
                            type="button"
                            className="underline underline-offset-4 hover:opacity-90"
                            onClick={() => onFocusField(key)}
                        >
                            {msg as string}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}