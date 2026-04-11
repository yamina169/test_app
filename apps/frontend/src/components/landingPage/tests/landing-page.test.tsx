import { render, screen } from "@testing-library/react";
import { axe } from "../../../../setupJest";
import { configureAxe } from "jest-axe";
import LandingPage from "../landing-page";

const strictAxe = configureAxe({
    rules: {
        region: { enabled: true },
    },
});

jest.mock("../site-header", () => {
    function MockSiteHeader() {
        return <header>SiteHeader</header>;
    }

    return MockSiteHeader;
});

jest.mock("../hero-section", () => {
    function MockHeroSection() {
        return <section>HeroSection</section>;
    }

    return MockHeroSection;
});

jest.mock("../service-section", () => {
    function MockServiceSection() {
        return <section>ServicesSection</section>;
    }

    return MockServiceSection;
});

jest.mock("../mobile-experience-section", () => {
    function MockMobileExperienceSection() {
        return <section>MobileExperienceSection</section>;
    }

    return MockMobileExperienceSection;
});

jest.mock("../contact-section", () => {
    function MockContactSection() {
        return <section>ContactSection</section>;
    }

    return MockContactSection;
});

describe("LandingPage", () => {
    it("renders the main landmark with skip-link target attributes (WCAG 2.4.1)", () => {
        render(<LandingPage />);

        const main = screen.getByRole("main");
        expect(main).toHaveAttribute("id", "main-content");
        expect(main).toHaveAttribute("tabIndex", "-1");
    });

    it("renders page sections inside main", () => {
        render(<LandingPage />);

        const main = screen.getByRole("main");

        expect(screen.getByText("SiteHeader")).toBeInTheDocument();
        expect(main).toContainElement(screen.getByText("HeroSection"));
        expect(main).toContainElement(screen.getByText("ServicesSection"));
        expect(main).toContainElement(screen.getByText("MobileExperienceSection"));
        expect(main).toContainElement(screen.getByText("ContactSection"));
    });

    it("renders header landmark outside main landmark (WCAG)", () => {
        render(<LandingPage />);

        const header = screen.getByRole("banner");
        const main = screen.getByRole("main");

        expect(header).toBeInTheDocument();
        expect(main).toBeInTheDocument();

        expect(main).not.toContainElement(header);
    });

    it("has no accessibility violations", async () => {
        render(<LandingPage />);

        const results = await axe(document.body);
        expect(results).toHaveNoViolations();
    });

    it("has correct landmark regions", async () => {
        render(<LandingPage />);

        const results = await strictAxe(document.body);
        expect(results).toHaveNoViolations();
    });
});