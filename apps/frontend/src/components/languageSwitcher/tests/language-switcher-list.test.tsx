import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcherList } from "../language-switcher-list";
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
        if (key === "localeName.en") return "English";
        if (key === "localeName.fr") return "Français";
        if (key === "localeName.ar") return "العربية";
        return key;
    },
    useLocale: () => "en",
}));

describe("LanguageSwitcherList", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = (props: { className?: string } = {}) =>
        render(<LanguageSwitcherList {...props} />);

    it("renders one button per locale with visible labels", () => {
        renderComponent();

        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(3);

        expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Français" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "العربية" })).toBeInTheDocument();
    });

    it("marks the current locale button with aria-current (WCAG 1.3.1)", () => {
        renderComponent();

        const englishBtn = screen.getByRole("button", { name: "English" });
        const frenchBtn = screen.getByRole("button", { name: "Français" });

        expect(englishBtn).toHaveAttribute("aria-current", "true");
        expect(frenchBtn).not.toHaveAttribute("aria-current");
    });

    it("sets correct lang attributes on labels", () => {
        renderComponent();

        expect(screen.getByText("English")).toHaveAttribute("lang", "en");
        expect(screen.getByText("Français")).toHaveAttribute("lang", "fr");
        expect(screen.getByText("العربية")).toHaveAttribute("lang", "ar");
    });

    it("calls router.replace with pathname + selected locale when clicking", async () => {
        const user = userEvent.setup();
        renderComponent();

        await user.click(screen.getByRole("button", { name: "Français" }));

        expect(replaceMock).toHaveBeenCalledTimes(1);
        expect(replaceMock).toHaveBeenCalledWith("/current-path", { locale: "fr" });
    });

    it("supports keyboard navigation (WCAG 2.1.1)", async () => {
        const user = userEvent.setup();
        renderComponent();

        await user.tab();
        expect(screen.getByRole("button", { name: "English" })).toHaveFocus();

        await user.tab();
        expect(screen.getByRole("button", { name: "Français" })).toHaveFocus();

        await user.keyboard("{Enter}");
        expect(replaceMock).toHaveBeenCalledWith("/current-path", { locale: "fr" });
    });

    it("has no accessibility violations", async () => {
        renderComponent();

        const results = await axe(document.body);
        expect(results).toHaveNoViolations();
    });
});