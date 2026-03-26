import { render, screen, within } from "@testing-library/react";
import { axe } from "../../../../setupJest";
import SiteHeader from "../site-header";
import * as React from "react";

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children?: React.ReactNode;
};

type MockButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    children?: React.ReactNode;
};

type DivProps = React.HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
};

type SvgIconProps = React.SVGProps<SVGSVGElement>;

jest.mock("@/domain/data/siteHeader", () => ({
    NAV_LINKS: [
        { href: "#hero", key: "home", fallbackLabel: "Home" },
        { href: "#mission", key: "mission", fallbackLabel: "Mission" },
        { href: "#contact", key: "contact", fallbackLabel: "Contact" },
    ],
}));

jest.mock("@/i18n/routing", () => ({
    Link: ({ children, ...props }: AnchorProps) => <a {...props}>{children}</a>,
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

jest.mock("@/components/ui/sheet", () => ({
    Sheet: ({ children }: DivProps) => <div>{children}</div>,
    SheetTrigger: ({ asChild, children }: { asChild?: boolean; children?: React.ReactNode }) => {
        if (asChild) return children;
        return <button>{children}</button>;
    },
    SheetContent: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
    SheetHeader: ({ children }: DivProps) => <div>{children}</div>,
    SheetTitle: ({
        children,
        ...props
    }: React.HTMLAttributes<HTMLHeadingElement> & { children?: React.ReactNode }) => (
        <h2 {...props}>{children}</h2>
    ),
}));

jest.mock("../../languageSwitcher/language-switcher-dropdown", () => ({
    LanguageSwitcherDropdown: (props: React.HTMLAttributes<HTMLDivElement>) => (
        <div data-testid="language-switcher-dropdown" {...props}>
            LanguageSwitcherDropdown
        </div>
    ),
}));

jest.mock("../../languageSwitcher/language-switcher-list", () => ({
    LanguageSwitcherList: () => (
        <div data-testid="language-switcher-list">LanguageSwitcherList</div>
    ),
}));

jest.mock("lucide-react", () => ({
    Menu: (props: SvgIconProps) => <svg data-testid="menu-icon" {...props} />,
}));

describe("SiteHeader", () => {
    it("renders banner landmark (WCAG 1.3.1)", () => {
        render(<SiteHeader />);

        expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("renders home logo link with accessible name (WCAG 4.1.2 / 2.4.4)", () => {
        render(<SiteHeader />);

        const homeLink = screen.getByRole("link", { name: "homeAriaLabel" });
        expect(homeLink).toHaveAttribute("href", "#hero");
    });

    it("renders logo images with meaningful alt text (WCAG 1.1.1)", () => {
        const { container } = render(<SiteHeader />);

        const images = container.querySelectorAll("img");
        expect(images).toHaveLength(2);

        expect(images[0]).toHaveAttribute("alt", "logoAlt");
        expect(images[1]).toHaveAttribute("alt", "logoAlt");
    });

    it("renders desktop navigation landmark and links (WCAG 2.4.1)", () => {
        render(<SiteHeader />);

        const nav = screen.getByRole("navigation", { name: "mainNav" });
        expect(nav).toBeInTheDocument();

        const links = within(nav).getAllByRole("link");
        expect(links).toHaveLength(3);

        expect(within(nav).getByRole("link", { name: "home" })).toHaveAttribute("href", "#hero");
        expect(within(nav).getByRole("link", { name: "mission" })).toHaveAttribute("href", "#mission");
        expect(within(nav).getByRole("link", { name: "contact" })).toHaveAttribute("href", "#contact");
    });

    it("renders the desktop language switcher", () => {
        render(<SiteHeader />);

        expect(screen.getByTestId("language-switcher-dropdown")).toBeInTheDocument();
    });

    it("renders mobile menu trigger with accessible name and decorative icon (WCAG 4.1.2)", () => {
        render(<SiteHeader />);

        const menuButton = screen.getByRole("button", { name: "openMenu" });
        expect(menuButton).toBeInTheDocument();

        const icon = screen.getByTestId("menu-icon");
        expect(icon).toHaveAttribute("aria-hidden", "true");
    });

    it("renders mobile navigation and language section content", () => {
        render(<SiteHeader />);

        const mobileNav = screen.getByRole("navigation", { name: "mobileNav" });
        expect(mobileNav).toBeInTheDocument();

        expect(within(mobileNav).getByRole("link", { name: "home" })).toHaveAttribute("href", "#hero");
        expect(within(mobileNav).getByRole("link", { name: "mission" })).toHaveAttribute("href", "#mission");
        expect(within(mobileNav).getByRole("link", { name: "contact" })).toHaveAttribute("href", "#contact");

        expect(screen.getByText("language")).toBeInTheDocument();
        expect(screen.getByTestId("language-switcher-list")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "menu", level: 2 })).toBeInTheDocument();
    });

    it("has no accessibility violations", async () => {
        render(<SiteHeader />);

        const results = await axe(document.body);
        expect(results).toHaveNoViolations();
    });
});