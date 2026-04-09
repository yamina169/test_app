"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function HeroSection() {
    const t = useTranslations("hero");
    const reduceMotion = useReducedMotion(); // WCAG 2.3.3: respects prefers-reduced-motion

    const leftAnim = reduceMotion
        ? {}
        : {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5 },
        };

    const rightAnim = reduceMotion
        ? {}
        : {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 0.6, delay: 0.2 },
        };

    return (
        <section
            id="hero"
            className="relative overflow-hidden pt-16 pb-28 md:pt-24 md:pb-36 bg-navy"
            aria-labelledby="hero-heading"
        // WCAG 1.3.1: section landmark is labeled via aria-labelledby
        >
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
                    {/* Left content */}
                    <motion.div className="flex-1 max-w-xl" {...leftAnim}>
                        <span
                            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold mb-6 text-white"
                        // WCAG: text is visible and high contrast against navy background (ensure contrast in design QA)
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                            {t("badge")}
                        </span>

                        <h1
                            id="hero-heading"
                            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-white text-balance"
                        // WCAG 2.4.6: clear heading structure (H1 for primary page heading)
                        >
                            {t("title")}
                        </h1>

                        <p className="text-lg leading-relaxed mb-8 max-w-md text-white/80">
                            {t("description")}
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            {/* WCAG 2.4.4: link purpose is clear (“Get Started”) */}
                            <Button
                                asChild
                                size="lg"
                                className="
                                            font-semibold shadow-md
                                            bg-accent text-accent-foreground
                                            hover:brightness-105
                                            focus-visible:ring-2 focus-visible:ring-offset-2
                                            focus-visible:ring-ring
                                            focus-visible:ring-offset-navy
                                        "
                            >
                                <a href="#">
                                    <span aria-hidden="true">→</span> {t("ctaPrimary")}
                                </a>
                            </Button>

                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="
                                            font-semibold
                                            bg-transparent
                                            text-navy-foreground
                                            border-2 border-white/40
                                            hover:bg-secondary
                                            hover:text-secondary-foreground
                                            focus-visible:ring-2 focus-visible:ring-offset-2
                                            focus-visible:ring-ring
                                            focus-visible:ring-offset-navy
                                        "
                            >
                                <a href="#mission">
                                    {t("ctaSecondary")}
                                </a>
                            </Button>
                        </div>
                    </motion.div>

                    {/* Right illustration */}
                    <motion.div className="flex-1 flex justify-center" {...rightAnim}>
                        <div className="relative w-full aspect-video rounded-2xl shadow-lg overflow-hidden">
                            {/* WCAG 1.1.1: decorative image => empty alt + aria-hidden */}
                            <Image
                                src="/landingPage/hero-illustration.jpg"
                                alt=""
                                aria-hidden="true"
                                fill
                                priority
                                className="object-cover"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Curved bottom wave */}
            <div className="absolute bottom-0 left-0 right-0 h-20" aria-hidden="true">
                <svg
                    viewBox="0 0 1440 80"
                    className="h-full w-full block"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0 80V40C360 70 720 80 1080 50C1260 35 1380 30 1440 32V80H0Z"
                        fill="var(--card)"
                    />
                </svg>
            </div>
        </section>
    );
}