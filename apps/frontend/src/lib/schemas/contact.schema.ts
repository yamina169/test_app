import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().trim().min(1, { message: "errors.fullNameRequired" }),

  email: z
    .string()
    .trim()
    .min(1, { message: "errors.emailRequired" })
    .pipe(z.email({ message: "errors.emailInvalid" })),

  subject: z.string().trim().min(1, { message: "errors.subjectRequired" }),

  message: z.string().trim().min(1, { message: "errors.messageRequired" }),
});

export type ContactValues = z.infer<typeof contactSchema>;
export type ContactErrors = Partial<Record<keyof ContactValues, string>>;
