"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { contactSchema, type ContactValues } from "@/lib/schemas/contact.schema";
import { ErrorSummary } from "@/components/form/error-summary";
import { FormField } from "@/components/form/field";
import { fieldIds, initialValues } from "@/domain/data/contact.data";
import { useZodForm } from "@/application/hooks/useZodForm";

export default function ContactSection() {
    const t = useTranslations("contact");
    const [submitted, setSubmitted] = React.useState(false);

    // WCAG 3.3.1 + 3.3.3: focus is moved to the error summary after failed submit
    const summaryRef = React.useRef<HTMLDivElement | null>(null);

    const form = useZodForm<ContactValues>({
        initialValues,
        schema: contactSchema,
        summaryRef,
        t: (k) => t(k),
    });

    function focusField(key: keyof ContactValues) {
        const id = fieldIds[key];
        const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
        // WCAG 2.4.3 Focus Order: users can jump from summary to the exact invalid control
        el?.focus();
    }

    function onSubmit(e: React.SyntheticEvent) {
        //Prevents the page from reloading
        e.preventDefault();

        const res = form.validate();
        if (!res.ok) return;

        // Note: later I'll be calling an API
        setSubmitted(true);
        form.clear();
    }

    function resetForm() {
        setSubmitted(false);
        form.clear();
    }

    return (
        <section
            id="contact"
            className="py-16 md:py-24 bg-card"
            aria-labelledby="contact-heading"
            aria-describedby="contact-description"
        // WCAG 1.3.1: relationships are defined via aria-labelledby/aria-describedby
        >
            <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 text-center">
                <h2 id="contact-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                    {/* WCAG 2.4.6: clear heading structure */}
                    {t("heading")}
                </h2>
                <p id="contact-description" className="text-lg text-foreground mb-8">
                    {t("description")}
                </p>

                <Card className="rounded-2xl border-border bg-background text-left shadow-sm">
                    <CardContent className="p-6 md:p-8">
                        {submitted ? (
                            <div
                                role="status"
                                aria-live="polite"
                                className="py-8 text-center"
                            // WCAG 4.1.3: status message is announced without stealing focus
                            >
                                <p className="text-xl font-semibold text-foreground">{t("success.title")}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{t("success.subtitle")}</p>
                                <Button className="mt-4" onClick={resetForm}>
                                    {t("success.sendAnother")}
                                </Button>
                            </div>
                        ) : (
                            <form
                                onSubmit={onSubmit}
                                noValidate
                                className="space-y-5"
                            >
                                <ErrorSummary<ContactValues>
                                    title={t("errors.summaryTitle")}
                                    errors={form.errors}
                                    summaryRef={summaryRef}
                                    onFocusField={focusField}
                                />

                                <div className="space-y-4">
                                    <FormField
                                        id={fieldIds.fullName}
                                        label={t("fields.fullName")}
                                        name="fullName"
                                        required
                                        autoComplete="name"
                                        value={form.values.fullName}
                                        onChange={(v) => form.setField("fullName", v)}
                                        error={form.errors.fullName}
                                    // WCAG 1.3.5: autocomplete helps users with cognitive/mobility needs
                                    />

                                    <FormField
                                        id={fieldIds.email}
                                        label={t("fields.email")}
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={form.values.email}
                                        onChange={(v) => form.setField("email", v)}
                                        error={form.errors.email}
                                    />

                                    <FormField
                                        id={fieldIds.subject}
                                        label={t("fields.subject")}
                                        name="subject"
                                        required
                                        value={form.values.subject}
                                        onChange={(v) => form.setField("subject", v)}
                                        error={form.errors.subject}
                                    />

                                    <FormField
                                        id={fieldIds.message}
                                        label={t("fields.message")}
                                        name="message"
                                        required
                                        textarea
                                        value={form.values.message}
                                        onChange={(v) => form.setField("message", v)}
                                        error={form.errors.message}
                                    />
                                </div>

                                <Button type="submit" className="w-full font-semibold">
                                    {t("actions.send")}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}