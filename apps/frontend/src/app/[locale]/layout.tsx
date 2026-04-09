import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { isRtl, Locale, locales } from "@/i18n/config";
import { notFound } from "next/navigation";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { DirectionProvider } from "@/components/ui/direction";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sabilouna",
  description: "Project & Journey Tracking SaaS",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;

  if (!locales.includes(locale)) notFound();

  setRequestLocale(locale);

  // Locale/messages are injected per request via getRequestConfig(requestLocale), so getMessages() needs no locale arg.
  const messages = await getMessages();
  const t = await getTranslations("accessibility");

  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"}>
      <body
        className={`${inter.variable} antialiased`}
      >

        <NextIntlClientProvider messages={messages}>
          {/* Accessibility: lets keyboard users skip header/nav and jump to main content (WCAG 2.4.1) */}
          <a href="#main-content" className="skip-link">
            {t("skipToContent")}
          </a>

          <DirectionProvider dir={isRtl(locale) ? "rtl" : "ltr"}>{children}</DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
