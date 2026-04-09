import * as React from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "../../../../setupJest";
import HeroSection from "../hero-section";
import { ImgHTMLAttributes } from "react";

interface MockButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    children?: React.ReactNode;
}

interface MockMotionDivProps extends React.HTMLAttributes<HTMLDivElement> {
    initial?: unknown;
    animate?: unknown;
    transition?: unknown;
}

jest.mock("next/image", () => ({
    __esModule: true,
    default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} alt={props.alt ?? ""} />;
    },
}));

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

const useReducedMotionMock = jest.fn<boolean, []>();

jest.mock("framer-motion", () => ({
    useReducedMotion: () => useReducedMotionMock(),
    motion: {
        div: ({ initial, animate, transition, ...rest }: MockMotionDivProps) => {
            const hasMotionProps = Boolean(initial || animate || transition);
            return (
                <div
                    data-has-motion={hasMotionProps ? "true" : "false"}
                    data-initial={initial ? JSON.stringify(initial) : ""}
                    data-animate={animate ? JSON.stringify(animate) : ""}
                    data-transition={transition ? JSON.stringify(transition) : ""}
                    {...rest}
                />
            );
        },
    },
}));

describe("HeroSection", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useReducedMotionMock.mockReturnValue(true);
    });

    it("renders labeled hero landmark (WCAG 1.3.1)", () => {
        render(<HeroSection />);

        const section = screen.getByRole("region", { name: "title" });
        expect(section).toHaveAttribute("id", "hero");
        expect(section).toHaveAttribute("aria-labelledby", "hero-heading");

        expect(screen.getByRole("heading", { name: "title", level: 1 })).toBeInTheDocument();
        expect(screen.getByText("description")).toBeInTheDocument();
        expect(screen.getByText("badge")).toBeInTheDocument();
    });

    it("renders CTAs with correct targets (WCAG 2.4.4)", () => {
        render(<HeroSection />);

        const primary = screen.getByRole("link", { name: /ctaPrimary/i });
        expect(primary).toHaveAttribute("href", "#");

        const secondary = screen.getByRole("link", { name: /ctaSecondary/i });
        expect(secondary).toHaveAttribute("href", "#mission");
    });

    it("renders decorative illustration with empty alt and aria-hidden (WCAG 1.1.1)", () => {
        const { container } = render(<HeroSection />);

        const img = container.querySelector('img[src="/landingPage/hero-illustration.jpg"]');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("alt", "");
        expect(img).toHaveAttribute("aria-hidden", "true");
    });

    it("respects prefers-reduced-motion by not applying animation props (WCAG 2.3.3)", () => {
        useReducedMotionMock.mockReturnValue(true);
        const { container } = render(<HeroSection />);

        const motionDivs = Array.from(container.querySelectorAll("div[data-has-motion]"));
        expect(motionDivs.length).toBeGreaterThanOrEqual(2);

        for (const el of motionDivs) {
            expect(el).toHaveAttribute("data-has-motion", "false");
            expect(el).toHaveAttribute("data-initial", "");
            expect(el).toHaveAttribute("data-animate", "");
            expect(el).toHaveAttribute("data-transition", "");
        }
    });

    it("applies animation props when reduced motion is off", () => {
        useReducedMotionMock.mockReturnValue(false);
        const { container } = render(<HeroSection />);

        const motionDivs = Array.from(container.querySelectorAll("div[data-has-motion]"));
        expect(motionDivs.length).toBeGreaterThanOrEqual(2);
        expect(motionDivs.some((el) => el.getAttribute("data-has-motion") === "true")).toBe(true);
    });

    it("has no accessibility violations", async () => {
        render(<HeroSection />);

        const results = await axe(document.body);
        expect(results).toHaveNoViolations();
    });
});