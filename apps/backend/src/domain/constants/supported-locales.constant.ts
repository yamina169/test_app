export const SUPPORTED_LOCALES = ['en', 'fr', 'ar'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
