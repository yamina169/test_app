import { render, screen } from "@testing-library/react";
import { axe } from "../../../../setupJest";
import MobileExperienceSection from "../mobile-experience-section";
import * as React from "react";

type MockButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    children?: React.ReactNode;
};

type MockBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
    children?: React.ReactNode;
};

type SvgIconProps = React.SVGProps<SVGSVGElement>;

jest.mock("@/components/ui/button", () => ({
    Button: ({ asChild, children, ...props }: MockButtonProps) => {
        if (asChild) {
            const child = React.Children.only(children);
            return React.isValidElement(child)
                ? React.cloneElement(child as React.ReactElement, props)
                : child;
        }
        return <button {...props}>{children}</button>;
    },
}));

jest.mock("@/components/ui/badge", () => ({
    Badge: ({ children, ...props }: MockBadgeProps) => <span {...props}>{children}</span>,
}));

jest.mock("lucide-react", () => ({
    Apple: (props: SvgIconProps) => <svg data-testid="apple-icon" {...props} />,
    Play: (props: SvgIconProps) => <svg data-testid="play-icon" {...props} />,
}));

jest.mock("@/domain/data/mobileExperience.data", () => ({
    FEATURES: [
        {
            key: "featureOne",
            Icon: (props: SvgIconProps) => <svg data-testid="feature-icon-1" {...props} />,
        },
        {
            key: "featureTwo",
            Icon: (props: SvgIconProps) => <svg data-testid="feature-icon-2" {...props} />,
        },
        {
            key: "featureThree",
            Icon: (props: SvgIconProps) => <svg data-testid="feature-icon-3" {...props} />,
        },
    ],
}));

describe("MobileExperienceSection", () => {
    it("renders section with heading and description relationships (WCAG 1.3.1)", () => {
        render(<MobileExperienceSection />);

        const section = screen.getByRole("region", { name: "title" });
        expect(section).toHaveAttribute("id", "mobile");
        expect(section).toHaveAttribute("aria-labelledby", "mobile-heading");
        expect(section).toHaveAttribute("aria-describedby", "mobile-description");

        expect(screen.getByRole("heading", { name: "title", level: 2 })).toBeInTheDocument();
        expect(screen.getByText("description")).toBeInTheDocument();
        expect(screen.getByText("eyebrow")).toBeInTheDocument();
    });

    it("renders all translated feature items from data", () => {
        render(<MobileExperienceSection />);

        expect(screen.getByText("features.featureOne")).toBeInTheDocument();
        expect(screen.getByText("features.featureTwo")).toBeInTheDocument();
        expect(screen.getByText("features.featureThree")).toBeInTheDocument();
    });

    it("renders decorative feature icons as hidden from assistive tech (WCAG 1.1.1)", () => {
        render(<MobileExperienceSection />);

        const icon1 = screen.getByTestId("feature-icon-1");
        const icon2 = screen.getByTestId("feature-icon-2");
        const icon3 = screen.getByTestId("feature-icon-3");

        expect(icon1).toHaveAttribute("aria-hidden", "true");
        expect(icon1).toHaveAttribute("focusable", "false");

        expect(icon2).toHaveAttribute("aria-hidden", "true");
        expect(icon2).toHaveAttribute("focusable", "false");

        expect(icon3).toHaveAttribute("aria-hidden", "true");
        expect(icon3).toHaveAttribute("focusable", "false");
    });

    it("renders store links with clear accessible names and correct targets (WCAG 2.4.4)", () => {
        render(<MobileExperienceSection />);

        const appStoreLink = screen.getByRole("link", { name: "store.appStoreAria" });
        const googlePlayLink = screen.getByRole("link", { name: "store.googlePlayAria" });

        expect(appStoreLink).toHaveAttribute("href", "#");
        expect(googlePlayLink).toHaveAttribute("href", "#");

        expect(screen.getByText("store.appStore")).toBeInTheDocument();
        expect(screen.getByText("store.googlePlay")).toBeInTheDocument();
    });

    it("renders decorative store icons as aria-hidden", () => {
        render(<MobileExperienceSection />);

        expect(screen.getByTestId("apple-icon")).toHaveAttribute("aria-hidden", "true");
        expect(screen.getByTestId("play-icon")).toHaveAttribute("aria-hidden", "true");
    });

    it("renders the decorative phone mock as aria-hidden (WCAG 1.1.1)", () => {
        render(<MobileExperienceSection />);

        const decorativeMock = screen.getByTestId("phone-mock");

        expect(decorativeMock).toHaveAttribute("aria-hidden", "true");
    });

    it("renders the footnote text", () => {
        render(<MobileExperienceSection />);

        expect(screen.getByText("footnote")).toBeInTheDocument();
    });

    it("has no accessibility violations", async () => {
        render(<MobileExperienceSection />);

        const results = await axe(document.body);
        expect(results).toHaveNoViolations();
    });
});