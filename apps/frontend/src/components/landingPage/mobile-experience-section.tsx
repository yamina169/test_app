"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Apple, Play } from "lucide-react";
import { FEATURES } from "@/domain/data/mobileExperience.data";


export default function MobileExperienceSection() {
    const t = useTranslations("mobile");

    return (
        <section
            id="mobile"
            className="bg-background py-16 md:py-24"
            aria-labelledby="mobile-heading"
            aria-describedby="mobile-description"
        /* WCAG 1.3.1: section programmatically tied to heading + description */
        >
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    {/* Left content */}
                    <div>
                        {/* WCAG 2.4.6: clear label; using Badge for visual tag */}
                        <Badge
                            variant="secondary"
                            className="mb-3 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
                        >
                            {t("eyebrow")}
                        </Badge>

                        <h2
                            id="mobile-heading"
                            className="text-3xl md:text-4xl font-bold text-foreground"
                        >
                            {t("title")}
                        </h2>

                        <p
                            id="mobile-description"
                            className="mt-3 max-w-xl text-base md:text-lg text-foreground"
                        >
                            {t("description")}
                        </p>

                        <ul className="mt-8 space-y-4">
                            {FEATURES.map(({ key, Icon }) => (
                                <li key={key} className="flex items-start gap-3">
                                    {/* WCAG 1.1.1: icon is decorative; text carries meaning */}
                                    <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-light text-primary">
                                        <Icon aria-hidden="true" focusable="false" size={18} />
                                    </span>

                                    {/* WCAG 1.4.3/1.4.6: use high-contrast token */}
                                    <p className="text-sm md:text-base leading-relaxed text-foreground">
                                        {t(`features.${key}`)}
                                    </p>
                                </li>
                            ))}
                        </ul>

                        {/* Store buttons */}
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button
                                asChild
                                className="bg-navy text-navy-foreground hover:brightness-110"
                            >
                                <a
                                    href="#"
                                    aria-label={t("store.appStoreAria")}
                                /* WCAG 2.4.4: clear purpose for SR via aria-label */
                                >
                                    <Apple className="mr-2" aria-hidden="true" />
                                    {t("store.appStore")}
                                </a>
                            </Button>

                            <Button
                                asChild
                                className="bg-navy text-navy-foreground hover:brightness-110"
                            >
                                <a href="#" aria-label={t("store.googlePlayAria")}>
                                    <Play className="mr-2" aria-hidden="true" />
                                    {t("store.googlePlay")}
                                </a>
                            </Button>
                        </div>

                        {/* Optional small note like in screenshot */}
                        <p className="mt-4 text-xs text-muted-foreground">
                            {t("footnote")}
                        </p>
                    </div>

                    {/* Right phone mock */}
                    <div className="flex justify-center lg:justify-end">
                        {/* Decorative mock container */}
                        <div
                            data-testid="phone-mock"
                            className="
                                        relative w-65 sm:w-[320px]
                                        aspect-9/16
                                        rounded-[2.25rem]
                                        bg-navy
                                        shadow-xl
                                        overflow-hidden
                                        ring-1 ring-border
                                    "
                            aria-hidden="true"
                        /* WCAG 1.1.1: decorative visual only */
                        >
                            <div className="absolute inset-0 bg-linear-to-b from-[#1A2552] to-[#0f1a3d]" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
                                <div className="text-navy-foreground/90 text-lg font-semibold">
                                    Sabilouna
                                </div>
                                <div className="mt-10 w-full space-y-3">
                                    <div className="h-2 w-3/4 rounded-full bg-white/15" />
                                    <div className="h-2 w-2/3 rounded-full bg-white/15" />
                                    <div className="mt-6 h-10 w-full rounded-xl bg-primary/90" />
                                </div>
                            </div>
                            <div className="absolute bottom-4 left-1/2 h-1.5 w-24 -translate-x-1/2 rounded-full bg-white/25" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}