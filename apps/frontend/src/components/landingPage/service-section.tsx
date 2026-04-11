import { SERVICES } from "@/domain/data/services.data";
import { useTranslations } from "next-intl";
import { ServiceCard } from "./service-card";

export default function ServicesSection() {
    const t = useTranslations("services");

    return (
        <section
            id="mission"
            className="py-16 md:py-24 bg-card"
            aria-labelledby="services-heading"
            aria-describedby="services-description"
        /* WCAG 1.3.1 Info and Relationships */
        >
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="text-center mb-12">
                    <h2
                        id="services-heading"
                        className="text-3xl md:text-4xl font-bold text-foreground mb-3"
                    /* WCAG 2.4.6 Headings and Labels */
                    >
                        {t("heading")}
                    </h2>

                    <p
                        id="services-description"
                        className="text-lg text-foreground max-w-2xl mx-auto"
                    /* WCAG 1.3.1 Info and Relationships */
                    >
                        {t("description")}
                    </p>
                </header>

                {/* WCAG 1.3.1 Info and Relationships: Use list semantics for grouped items. */}
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
                    {SERVICES.map((item) => (
                        <li key={item.key} className="h-full">
                            <ServiceCard item={item} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}