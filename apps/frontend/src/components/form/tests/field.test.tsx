import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormField } from "../field";
import { axe } from "../../../../setupJest";

describe("FormField", () => {
    const defaultProps = {
        label: "Full name",
        name: "fullName",
        value: "",
        onChange: jest.fn(),
    };

    const renderFormField = (props = {}) =>
        render(<FormField {...defaultProps} {...props} />);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders label and input", () => {
        renderFormField();

        const input = screen.getByLabelText("Full name");

        expect(input).toBeInTheDocument();
    });

    it("calls onChange when typing", async () => {
        const user = userEvent.setup();
        const handleChange = jest.fn();

        renderFormField({ onChange: handleChange });

        const input = screen.getByLabelText("Full name");

        await user.type(input, "Sana");

        expect(handleChange).toHaveBeenCalled();
    });

    it("shows required indicator", () => {
        renderFormField({ required: true });

        const input = screen.getByLabelText(/full name/i, { exact: false })
        expect(screen.getByText("*")).toBeInTheDocument();
        expect(input).toHaveAttribute("aria-required", "true");
    });

    it("displays error message", () => {
        renderFormField({ error: "Name is required" });

        expect(screen.getByText("Name is required")).toBeInTheDocument();
    });

    it("links error message to input via aria attributes", () => {
        renderFormField({ error: "Name is required" });

        const input = screen.getByLabelText("Full name");

        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAttribute("aria-errormessage");

        expect(screen.getByRole("alert")).toHaveTextContent("Name is required");
    });

    it("links hint text via aria-describedby", () => {
        renderFormField({ hint: "Enter your full legal name" });

        const input = screen.getByLabelText("Full name");
        const hint = screen.getByText("Enter your full legal name");
        const describedBy = input.getAttribute("aria-describedby");
        expect(describedBy).toContain(hint.id);
    });

    it("renders textarea when textarea prop is true", () => {
        renderFormField({
            label: "Message",
            name: "message",
            value: "",
            textarea: true,
            onChange: () => { },
        });

        const textarea = screen.getByLabelText("Message");

        expect(textarea.tagName).toBe("TEXTAREA");
    });

    it("supports keyboard focus", async () => {
        const user = userEvent.setup();

        renderFormField();

        await user.tab();

        const input = screen.getByLabelText("Full name");

        expect(input).toHaveFocus();
    });

    it("has no accessibility violations", async () => {
        const { container } = renderFormField();

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it("error state remains accessible", async () => {
        const { container } = renderFormField({ error: "Name is required" });

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});