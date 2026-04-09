import "@testing-library/jest-dom";
import { configureAxe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

jest.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}));

export const axe = configureAxe({
    rules: {
        "color-contrast": { enabled: true },
        "heading-order": { enabled: true },
        // Disable for isolated component tests; enable in page/layout-level tests
        region: { enabled: false },
    },
});

// WCAG tests (jest-axe) can trigger canvas checks; jsdom doesn't implement canvas.
Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    value: () => null,
});