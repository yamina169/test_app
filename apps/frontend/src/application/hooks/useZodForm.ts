"use client";

import * as React from "react";
import type { z } from "zod";
import { mapZodErrors } from "@/lib/zod/mapZodErrors";

type Translator = (key: string) => string;

type UseZodFormOptions<T extends Record<string, unknown>> = {
    initialValues: T;
    schema: z.ZodType<T>;
    // WCAG 3.3.1 + 2.4.3: focus target after failed submit (programmatic focus)
    summaryRef?: React.RefObject<HTMLDivElement | null>;
    t?: Translator;
};

export function useZodForm<T extends Record<string, unknown>>({
    initialValues,
    schema,
    summaryRef,
    t,
}: UseZodFormOptions<T>) {
    const [values, setValues] = React.useState<T>(initialValues);
    const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({});

    function setField<K extends keyof T>(key: K, value: T[K]) {
        setValues((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    function clear() {
        setValues(initialValues);
        setErrors({});
    }

    function validate(): { ok: true; values: T } | { ok: false; errors: Partial<Record<keyof T, string>> } {
        const result = schema.safeParse(values);

        if (result.success) return { ok: true, values: result.data };

        const mapped = mapZodErrors<T>(result.error);

        const translated: Partial<Record<keyof T, string>> = {};
        for (const [k, msgKey] of Object.entries(mapped)) {
            const key = k as keyof T;
            translated[key] = msgKey ? (t ? t(msgKey) : msgKey) : undefined;
        }

        setErrors(translated);
        summaryRef?.current?.focus();

        return { ok: false, errors: translated };
    }

    return {
        values,
        errors,
        setField,
        setValues,
        setErrors,
        clear,
        validate,
    };
}