import * as React from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "../../../../setupJest";
import { ServiceCard } from "../service-card";
import type { ServiceItem } from "@/domain/models/services";

type MockCardProps = React.HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
};

jest.mock("@/components/ui/card", () => ({
    Card: ({ children, ...props }: MockCardProps) => <div {...props}>{children}</div>,
    CardContent: ({ children, ...props }: MockCardProps) => <div {...props}>{children}</div>,
}));

describe("ServiceCard", () => {
    const MockIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
        (props, ref) => <svg ref={ref} data-testid="service-icon" {...props} />
    );

    MockIcon.displayName = "MockIcon";

    const item: ServiceItem = {
        key: "testService",
        Icon: MockIcon as ServiceItem["Icon"],
        titleKey: "title",
        descriptionKey: "description",
    };

    it("renders the service title and description", () => {
        render(<ServiceCard item={item} />);

        expect(screen.getByRole("heading", { name: "title", level: 3 })).toBeInTheDocument();
        expect(screen.getByText("description")).toBeInTheDocument();
    });

    it("renders the decorative icon with correct accessibility attributes (WCAG 1.1.1)", () => {
        render(<ServiceCard item={item} />);

        const icon = screen.getByTestId("service-icon");
        expect(icon).toHaveAttribute("aria-hidden", "true");
        expect(icon).toHaveAttribute("focusable", "false");
    });

    it("has no accessibility violations", async () => {
        render(<ServiceCard item={item} />);

        const results = await axe(document.body);
        expect(results).toHaveNoViolations();
    });
});