import { render, screen, within } from "@testing-library/react";
import { axe } from "../../../../setupJest";
import ServicesSection from "../service-section";
import type { ServiceItem } from "@/domain/models/services";

jest.mock("@/domain/data/services.data", () => ({
    SERVICES: [
        {
            key: "serviceOne",
            Icon: () => null,
            titleKey: "titleOne",
            descriptionKey: "descriptionOne",
        },
        {
            key: "serviceTwo",
            Icon: () => null,
            titleKey: "titleTwo",
            descriptionKey: "descriptionTwo",
        },
        {
            key: "serviceThree",
            Icon: () => null,
            titleKey: "titleThree",
            descriptionKey: "descriptionThree",
        },
    ],
}));

jest.mock("../service-card", () => ({
    ServiceCard: ({ item }: { item: ServiceItem }) => (
        <article data-testid={`service-card-${item.key}`}>
            <h3>{item.titleKey}</h3>
            <p>{item.descriptionKey}</p>
        </article>
    ),
}));

describe("ServicesSection", () => {
    it("renders section with heading and description relationships (WCAG 1.3.1)", () => {
        render(<ServicesSection />);

        const section = screen.getByRole("region", { name: "heading" });
        expect(section).toHaveAttribute("id", "mission");
        expect(section).toHaveAttribute("aria-labelledby", "services-heading");
        expect(section).toHaveAttribute("aria-describedby", "services-description");

        expect(screen.getByRole("heading", { name: "heading", level: 2 })).toBeInTheDocument();
        expect(screen.getByText("description")).toBeInTheDocument();
    });

    it("renders services inside a semantic list (WCAG 1.3.1)", () => {
        render(<ServicesSection />);

        const list = screen.getByRole("list");
        const items = within(list).getAllByRole("listitem");

        expect(items).toHaveLength(3);
    });

    it("renders one ServiceCard for each service item", () => {
        render(<ServicesSection />);

        expect(screen.getByTestId("service-card-serviceOne")).toBeInTheDocument();
        expect(screen.getByTestId("service-card-serviceTwo")).toBeInTheDocument();
        expect(screen.getByTestId("service-card-serviceThree")).toBeInTheDocument();

        expect(screen.getByText("titleOne")).toBeInTheDocument();
        expect(screen.getByText("titleTwo")).toBeInTheDocument();
        expect(screen.getByText("titleThree")).toBeInTheDocument();
    });

    it("has no accessibility violations", async () => {
        render(<ServicesSection />);

        const results = await axe(document.body);
        expect(results).toHaveNoViolations();
    });
});