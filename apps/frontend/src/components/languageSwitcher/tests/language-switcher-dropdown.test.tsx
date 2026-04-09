import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcherDropdown } from "../language-switcher-dropdown";
import { axe } from "../../../../setupJest";


const replaceMock = jest.fn();

jest.mock("@/i18n/routing", () => ({
    useRouter: () => ({ replace: replaceMock }),
    usePathname: () => "/current-path",
}));

jest.mock("@/i18n/config", () => ({
    locales: ["en", "fr", "ar"],
}));

jest.mock("next-intl", () => ({
    useTranslations: () => (key: string) => {
        if (key === "language") return "Language";
        if (key === "localeName.en") return "English";
        if (key === "localeName.fr") return "Français";
        if (key === "localeName.ar") return "العربية";
        return key;
    },
    useLocale: () => "en",
}));

describe("LanguageSwitcherDropdown", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = (props: { className?: string } = {}) =>
        render(<LanguageSwitcherDropdown {...props} />);

    it("renders a button with an accessible name including current locale (WCAG 4.1.2)", () => {
        renderComponent();

        const button = screen.getByRole("button", { name: "Language: English" });
        expect(button).toBeInTheDocument();

        expect(button).toHaveTextContent("English");
    });

    it("opens the menu on click and shows all locales as menu items", async () => {
        const user = userEvent.setup();
        renderComponent();

        const button = screen.getByRole("button", { name: "Language: English" });
        await user.click(button);

        expect(screen.getByRole("menu")).toBeInTheDocument();

        const items = screen.getAllByRole("menuitem");
        expect(items).toHaveLength(3);

        const englishItem = screen.getByRole("menuitem", { name: "English" });
        const frenchItem = screen.getByRole("menuitem", { name: "Français" });
        const arabicItem = screen.getByRole("menuitem", { name: "العربية" });

        expect(englishItem).toBeInTheDocument();
        expect(frenchItem).toBeInTheDocument();
        expect(arabicItem).toBeInTheDocument();

        expect(englishItem.querySelector("span")).toHaveAttribute("lang", "en");
        expect(frenchItem.querySelector("span")).toHaveAttribute("lang", "fr");
        expect(arabicItem.querySelector("span")).toHaveAttribute("lang", "ar");
    });

    it("marks the current locale item with aria-current (WCAG 1.3.1)", async () => {
        const user = userEvent.setup();
        renderComponent();

        await user.click(screen.getByRole("button", { name: "Language: English" }));

        const englishItem = screen.getByRole("menuitem", { name: "English" });
        const frenchItem = screen.getByRole("menuitem", { name: "Français" });

        expect(englishItem).toHaveAttribute("aria-current", "true");
        expect(frenchItem).not.toHaveAttribute("aria-current");
    });

    it("calls router.replace with pathname + selected locale when choosing an option", async () => {
        const user = userEvent.setup();
        renderComponent();

        await user.click(screen.getByRole("button", { name: "Language: English" }));
        await user.click(screen.getByRole("menuitem", { name: "Français" }));

        expect(replaceMock).toHaveBeenCalledTimes(1);
        expect(replaceMock).toHaveBeenCalledWith("/current-path", { locale: "fr" });
    });

    it("supports keyboard access: tab to button, Enter opens menu (WCAG 2.1.1)", async () => {
        const user = userEvent.setup();
        renderComponent();

        await user.tab();
        const button = screen.getByRole("button", { name: "Language: English" });
        expect(button).toHaveFocus();

        await user.keyboard("{Enter}");
        expect(screen.getByRole("menu")).toBeInTheDocument();

        // Pressing Escape should close the menu (no keyboard trap)
        await user.keyboard("{Escape}");
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("has no accessibility violations (closed state)", async () => {
        renderComponent();

        const results = await axe(document.body);
        expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations (open state, portal included)", async () => {
        const user = userEvent.setup();
        renderComponent();

        await user.click(screen.getByRole("button", { name: "Language: English" }));

        const results = await axe(document.body);
        expect(results).toHaveNoViolations();
    });
});