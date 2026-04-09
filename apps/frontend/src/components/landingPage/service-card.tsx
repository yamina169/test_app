import { Card, CardContent } from "@/components/ui/card";
import { ServiceItem } from "@/domain/models/services";
import { useTranslations } from "next-intl";

type Props = { item: ServiceItem };

export function ServiceCard({ item }: Props) {
    const t = useTranslations("services");
    const { Icon, titleKey, descriptionKey } = item;

    return (
        <Card className="h-full border-border bg-background">
            <CardContent className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-light text-primary">
                    {/* WCAG 1.1.1 Non-text Content: Decorative icon (text already conveys meaning). */}
                    <Icon aria-hidden="true" focusable="false" size={24} />
                </div>

                {/* WCAG 2.4.6 Headings and Labels */}
                <h3 className="text-lg font-semibold text-foreground">
                    {t(titleKey)}
                </h3>

                {/* WCAG 1.4.3 / 1.4.6 Contrast */}
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                    {t(descriptionKey)}
                </p>
            </CardContent>
        </Card>
    );
}