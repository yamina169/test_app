"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { NAV_LINKS } from "@/domain/data/siteHeader";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSwitcherDropdown } from "../languageSwitcher/language-switcher-dropdown";
import { LanguageSwitcherList } from "../languageSwitcher/language-switcher-list";


export default function SiteHeader() {
    const t = useTranslations("nav");

    return (
        <header
            className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80"
            // WCAG 1.3.1 (Info and Relationships): landmark for assistive tech.
            role="banner"
        >
            <div className="container mx-auto flex items-center justify-between px-4 py-3">
                {/* Logo */}
                <Link
                    href="#hero"
                    className="flex items-center gap-3 rounded-md focus:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2"
                    // WCAG 4.1.2 (Name, Role, Value): give the link an accessible name
                    aria-label={t("homeAriaLabel")}
                >
                    {/* WCAG 1.1.1 (Non-text Content): provide alt text for meaningful logo */}
                    <span className="relative h-10 w-40">
                        {/* Light mode logo */}
                        <Image
                            src="/logo/logo-light.png"
                            alt={t("logoAlt")}
                            fill
                            priority
                            sizes="160px"
                            className="object-contain dark:hidden"
                        />
                        {/* Dark mode logo */}
                        <Image
                            src="/logo/logo-dark.png"
                            alt={t("logoAlt")}
                            fill
                            priority
                            sizes="160px"
                            className="hidden object-contain dark:block"
                        />
                    </span>

                    <span className="sr-only">
                        {/* WCAG 2.4.4 (Link Purpose): clear label for screen readers */}
                        {t("homeLinkText")}
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav
                    className="hidden md:flex items-center gap-1"
                    // WCAG 2.4.1 (Bypass Blocks): labeled navigation landmark improves SR navigation.
                    aria-label={t("mainNav")}
                >
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                        >
                            {t(link.key) || link.fallbackLabel}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    {/* Language switcher (Desktop) */}
                    <LanguageSwitcherDropdown className="hidden md:block" />

                    {/* Mobile menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="md:hidden"
                                // WCAG 4.1.2: icon button needs a text alternative.
                                aria-label={t("openMenu")}
                            >
                                <Menu className="h-5 w-5" aria-hidden="true" />
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="right" className="w-[320px] sm:w-90">
                            <SheetHeader>
                                <SheetTitle className="text-left">{t("menu")}</SheetTitle>
                            </SheetHeader>

                            <nav
                                className="mt-4 flex flex-col gap-1"
                                // WCAG 2.4.1: labeled navigation landmark.
                                aria-label={t("mobileNav")}
                            >
                                {NAV_LINKS.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        className="rounded-md px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                                    >
                                        {t(link.key) || link.fallbackLabel}
                                    </a>
                                ))}
                            </nav>

                            <div className="mt-6 border-t border-border pt-4">
                                <p className="px-4 text-xs font-semibold text-muted-foreground uppercase">
                                    {t("language")}
                                </p>

                                <LanguageSwitcherList />
                            </div>

                            {/* WCAG 2.1.2 (No Keyboard Trap) */}
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

        </header>
    );
}