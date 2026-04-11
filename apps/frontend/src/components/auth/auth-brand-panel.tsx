"use client";

import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

const HIGHLIGHTS = [1, 2, 3] as const;

export function AuthBrandPanel() {
  const t = useTranslations("register");

  return (
    <div
      className="hidden md:flex  text-white h-full w-full flex-col items-center justify-center gap-6 p-10 bg-gradient-hero"
      aria-hidden="true"
    >
      <Image
        src="/logo/logo-dark.png"
        alt="Logo"
        width={200}
        height={80}
        className="drop-shadow-lg"
        priority
      />

      <p className="text-center text-xl md:text-2xl font-semibold leading-relaxed text-hero-contrast text-balance">
        {t("brand.slogan")}
      </p>

      <p className="max-w-md text-center text-sm md:text-base leading-relaxed">
        {t("brand.description")}
      </p>

      <ul className="mt-2 w-full max-w-xs space-y-3">
        {HIGHLIGHTS.map((i) => (
          <li key={i} className="flex items-start gap-3 text-white">
            <CheckCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-accent"
              aria-hidden="true"
            />
            <span className="text-sm leading-snug md:text-base">
              {t(`brand.highlight${i}`)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
