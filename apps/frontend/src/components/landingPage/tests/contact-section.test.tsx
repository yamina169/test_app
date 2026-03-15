import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactSection from "../contact-section";
import { axe } from "../../../../setupJest";
import * as React from "react";
import type { ContactErrors, ContactValues } from "@/lib/schemas/contact.schema";

type UseZodFormOptions<T extends Record<string, unknown>> = {
    initialValues: T;
    schema: unknown;
    summaryRef?: React.RefObject<HTMLDivElement | null>;
    t?: (key: string) => string;
};

type UseZodFormReturn<T extends Record<string, unknown>> = {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    setField: <K extends keyof T>(key: K, value: T[K]) => void;
    clear: () => void;
    validate: () =>
        | { ok: true; values: T }
        | { ok: false; errors: Partial<Record<keyof T, string>> };
};

const clearMock = jest.fn<void, []>();
const validateMock = jest.fn<
    { ok: true; values: ContactValues } | { ok: false; errors: ContactErrors },
    []
>();
const setFieldMock = jest.fn<void, [keyof ContactValues, ContactValues[keyof ContactValues]]>();

const valuesFixture: ContactValues = {
    fullName: "",
    email: "",
    subject: "",
    message: "",
};

const validResult: { ok: true; values: ContactValues } = {
    ok: true,
    values: valuesFixture,
};

const useZodFormMock = jest.fn<
    UseZodFormReturn<ContactValues>,
    [UseZodFormOptions<ContactValues>]
>(() => ({
    values: valuesFixture,
    errors: {},
    setField: (key, value) => setFieldMock(key, value),
    clear: clearMock,
    validate: validateMock,
}));

jest.mock("@/application/hooks/useZodForm", () => ({
    useZodForm: (opts: UseZodFormOptions<ContactValues>) => useZodFormMock(opts),
}));

jest.mock("@/domain/data/contact.data", () => ({
    fieldIds: {
        fullName: "contact-fullName",
        email: "contact-email",
        subject: "contact-subject",
        message: "contact-message",
    },
    initialValues: {
        fullName: "",
        email: "",
        subject: "",
        message: "",
    },
}));

jest.mock("@/lib/schemas/contact.schema", () => ({
    contactSchema: {},
}));

jest.mock("@/components/form/error-summary", () => ({
    ErrorSummary: ({
        title,
        onFocusField,
    }: {
        title: string;
        onFocusField: (key: keyof ContactValues) => void;
    }) => (
        <div>
            <h3>{title}</h3>
            <button type="button" onClick={() => onFocusField("email")}>
                Focus email
            </button>
        </div>
    ),
}));

describe("ContactSection", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        validateMock.mockReturnValue(validResult);
    });

    it("renders section with heading/description relationships (WCAG 1.3.1)", () => {
        render(<ContactSection />);

        const section = screen.getByRole("region", { name: "heading" });
        expect(section).toHaveAttribute("aria-labelledby", "contact-heading");
        expect(section).toHaveAttribute("aria-describedby", "contact-description");

        expect(screen.getByRole("heading", { name: "heading", level: 2 })).toBeInTheDocument();
        expect(screen.getByText("description")).toBeInTheDocument();
    });

    it("renders the form fields and submit button", () => {
        render(<ContactSection />);

        expect(screen.getByRole("textbox", { name: /fields\.fullName/i })).toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: /fields\.email/i })).toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: /fields\.subject/i })).toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: /fields\.message/i })).toBeInTheDocument();

        expect(screen.getByRole("button", { name: "actions.send" })).toBeInTheDocument();
    });

    it("does not submit when validate() fails", async () => {
        const user = userEvent.setup();
        validateMock.mockReturnValue({ ok: false, errors: {} });

        render(<ContactSection />);

        await user.click(screen.getByRole("button", { name: "actions.send" }));

        expect(validateMock).toHaveBeenCalledTimes(1);
        expect(clearMock).not.toHaveBeenCalled();
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("submits when validate() succeeds, clears form, and shows success status (WCAG 4.1.3)", async () => {
        const user = userEvent.setup();
        validateMock.mockReturnValue(validResult);

        render(<ContactSection />);

        await user.click(screen.getByRole("button", { name: "actions.send" }));

        expect(validateMock).toHaveBeenCalledTimes(1);
        expect(clearMock).toHaveBeenCalledTimes(1);

        const status = screen.getByRole("status");
        expect(status).toHaveAttribute("aria-live", "polite");
        expect(screen.getByText("success.title")).toBeInTheDocument();
        expect(screen.getByText("success.subtitle")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "success.sendAnother" })).toBeInTheDocument();
    });

    it("resets success state when clicking 'Send another' and clears form again", async () => {
        const user = userEvent.setup();
        validateMock.mockReturnValue(validResult);

        render(<ContactSection />);

        await user.click(screen.getByRole("button", { name: "actions.send" }));
        expect(screen.getByRole("status")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "success.sendAnother" }));

        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "actions.send" })).toBeInTheDocument();
        expect(clearMock).toHaveBeenCalledTimes(2);
    });

    it("focuses the correct field when error summary action is used (WCAG 2.4.3)", async () => {
        const user = userEvent.setup();
        render(<ContactSection />);

        const emailInput = screen.getByRole("textbox", { name: /fields\.email/i });
        expect(emailInput).toHaveAttribute("id", "contact-email");

        await user.click(screen.getByRole("button", { name: "Focus email" }));
        expect(emailInput).toHaveFocus();
    });

    it("has no accessibility violations (form state)", async () => {
        render(<ContactSection />);

        const results = await axe(document.body);
        expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations (success state)", async () => {
        const user = userEvent.setup();
        validateMock.mockReturnValue(validResult);

        render(<ContactSection />);
        await user.click(screen.getByRole("button", { name: "actions.send" }));

        const results = await axe(document.body);
        expect(results).toHaveNoViolations();
    });
});