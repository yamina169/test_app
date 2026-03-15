import type { ZodError } from "zod";

export function mapZodErrors<T extends Record<string, unknown>>(
    error: ZodError
): Partial<Record<keyof T, string>> {
    const out: Partial<Record<keyof T, string>> = {};

    for (const issue of error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") {
            out[key as keyof T] = issue.message;
        }
    }

    return out;
}