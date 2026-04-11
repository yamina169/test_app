// apps/frontend/src/components/i18n/language-switcher-list.tsx
"use client";

import { useTranslations, useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { locales } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/routing";

type Props = {
    className?: string;
};

export function LanguageSwitcherList({ className }: Props) {
    const t = useTranslations("nav");
    const locale = useLocale() as Locale;

    const router = useRouter();
    const pathname = usePathname();

    const onChange = (nextLocale: Locale) => {
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <div className={className}>
            <div className="mt-2 flex flex-col gap-1">
                {locales.map((lc) => (
                    <Button
                        key={lc}
                        variant={lc === locale ? "secondary" : "ghost"}
                        className="justify-start"
                        onClick={() => onChange(lc)}
                        aria-current={lc === locale ? "true" : undefined}
                    >
                        <span lang={lc}>{t(`localeName.${lc}`)}</span>
                    </Button>
                ))}
            </div>
        </div>
    );
}