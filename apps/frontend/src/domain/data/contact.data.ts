import { ContactValues } from "@/lib/schemas/contact.schema";

export const initialValues: ContactValues = {
    fullName: "",
    email: "",
    subject: "",
    message: "",
};

export const fieldIds: Record<keyof ContactValues, string> = {
    fullName: "contact-fullName",
    email: "contact-email",
    subject: "contact-subject",
    message: "contact-message",
}