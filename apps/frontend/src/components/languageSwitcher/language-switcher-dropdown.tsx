"use client";

import { Globe } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { locales } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/routing";

type Props = {
    className?: string;
};

export function LanguageSwitcherDropdown({ className }: Props) {
    const t = useTranslations("nav");
    const locale = useLocale() as Locale;

    const router = useRouter();
    const pathname = usePathname();

    const onChange = (nextLocale: Locale) => {
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <div className={className}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="gap-2"
                        // WCAG 4.1.2: label includes current selection.
                        aria-label={`${t("language")}: ${t(`localeName.${locale}`)}`}
                    >
                        <Globe className="h-4 w-4" aria-hidden="true" />
                        <span>{t(`localeName.${locale}`)}</span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-44">
                    {locales.map((lc) => (
                        <DropdownMenuItem
                            key={lc}
                            onClick={() => onChange(lc)}
                            // WCAG 1.3.1: convey current selection to assistive tech.
                            aria-current={lc === locale ? "true" : undefined}
                        >
                            <span className={lc === locale ? "font-semibold" : undefined} lang={lc}>
                                {t(`localeName.${lc}`)}
                            </span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>

                {/* WCAG 2.1.1 (Keyboard) + 2.1.2 (No Keyboard Trap) */}
            </DropdownMenu>
        </div>
    );
}