import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import * as React from "react";
import { ErrorSummary } from "../error-summary";

type FormFields = {
    fullName: string;
    email: string;
    password: string;
};

describe("ErrorSummary", () => {
    const title = "Please fix the following errors:";
    const errors: Partial<Record<keyof FormFields, string>> = {
        fullName: "Full name is required",
        email: "Email is invalid",
    };

    let onFocusField: jest.Mock;
    let summaryRef: React.RefObject<HTMLDivElement | null>;

    const renderErrorSummary = (overrides: Partial<{
        title: string;
        errors: Partial<Record<keyof FormFields, string>>;
        summaryRef: React.RefObject<HTMLDivElement | null>;
        onFocusField: jest.Mock;
    }> = {}) => {
        const props = {
            title,
            errors,
            summaryRef,
            onFocusField,
            ...overrides,
        };

        return render(<ErrorSummary<FormFields> {...props} />);
    };

    beforeEach(() => {
        onFocusField = jest.fn();
        summaryRef = React.createRef<HTMLDivElement>();
    });

    it("renders title and error messages", () => {
        renderErrorSummary();

        expect(screen.getByText(title)).toBeInTheDocument();

        // Check each error message
        expect(screen.getByText("Full name is required")).toBeInTheDocument();
        expect(screen.getByText("Email is invalid")).toBeInTheDocument();

        // Should render as buttons for accessibility
        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(2);
        expect(buttons[0]).toHaveTextContent("Full name is required");
        expect(buttons[1]).toHaveTextContent("Email is invalid");
    });

    it("calls onFocusField when clicking error message", async () => {
        const user = userEvent.setup();

        renderErrorSummary();

        const fullNameButton = screen.getByText("Full name is required");

        await user.click(fullNameButton);

        expect(onFocusField).toHaveBeenCalledWith("fullName");
    });

    it("attaches ref and can be focused programmatically", () => {
        renderErrorSummary();

        expect(summaryRef.current).toBeInstanceOf(HTMLDivElement);

        // Programmatically focus
        summaryRef.current?.focus();
        expect(document.activeElement).toBe(summaryRef.current);
    });

    it("does not render when there are no errors", () => {
        const { container } = renderErrorSummary({ errors: {} });

        expect(container.firstChild).toBeNull();
    });

    it("is accessible and has no violations", async () => {
        const { container } = renderErrorSummary();

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it("renders with proper aria attributes for WCAG", () => {
        renderErrorSummary();

        const summary = screen.getByRole("alert");

        expect(summary).toHaveAttribute("tabindex", "-1");
        expect(summary).toHaveAttribute("aria-live", "assertive");
    });
});