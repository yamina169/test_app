// Defines i18n routing settings: supported locales, default locale, and URL prefix behavior.

import { createNavigation } from "next-intl/navigation";
import { locales, defaultLocale } from "./config";

export const routing = {
    locales,
    defaultLocale,
    localePrefix: "always" as const
};

export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);