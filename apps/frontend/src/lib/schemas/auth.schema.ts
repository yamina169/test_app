import { z } from "zod";
import { OccupationStatus } from "@/domain/enums/user.enum";

export const loginWithEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "errors.emailRequired" })
    .email({ message: "errors.emailInvalid" }),
  password: z.string().trim().min(8, { message: "errors.passwordMin" }),
});

export type LoginWithEmailValues = z.infer<typeof loginWithEmailSchema>;
export type LoginWithEmailErrors = Partial<
  Record<keyof LoginWithEmailValues, string>
>;

export const loginWithHandicapCardSchema = z.object({
  handicapCardId: z.string().trim().min(1, { message: "errors.required" }),
});

export type LoginWithHandicapCardValues = z.infer<
  typeof loginWithHandicapCardSchema
>;
export type LoginWithHandicapCardErrors = Partial<
  Record<keyof LoginWithHandicapCardValues, string>
>;

export const registerSchema = z.object({
  fullName: z.string().trim().min(3, { message: "errors.fullNameMin" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "errors.emailRequired" })
    .email({ message: "errors.emailInvalid" }),
  phone: z.string().regex(/^\+\d{8,15}$/, { message: "errors.phoneInvalid" }),
  password: z.string().trim().min(8, { message: "errors.passwordMin" }),
  roleId: z.number().int().min(1, { message: "errors.required" }),
  otpCode: z
    .string()
    .length(6, { message: "errors.otpLength" })
    .regex(/^\d{6}$/, { message: "errors.otpNumeric" }),

  handicapCardId: z.string().optional(),
  dateOfBirth: z.date().optional(),
  governorate: z.string().optional(),
  city: z.string().optional(),
  handicapType: z.string().optional(),
  requiredAccommodation: z.array(z.string()).optional(),
  occupationStatus: z.nativeEnum(OccupationStatus).optional(),
  caregiver: z.boolean().optional(),

  institutionName: z.string().optional(),
  institutionPhone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+\d{8,15}$/.test(val), {
      message: "errors.phoneInvalid",
    }),
  institutionEmail: z
    .string()
    .optional()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "errors.emailInvalid",
    }),
  institutionGovernorate: z.string().optional(),
  institutionCity: z.string().optional(),
  website: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\/[^\s$.?#].[^\s]*$/.test(val), {
      message: "errors.urlInvalid",
    }),
  typeOfServices: z.array(z.string()).optional(),
  accessible: z.boolean().optional(),
  specificEquipment: z.array(z.string()).optional(),
});

export type RegisterValues = z.infer<typeof registerSchema>;
export type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

// Schéma UNIQUEMENT pour le nouveau mot de passe (NewPasswordForm)
export const confirmResetSchema = z
  .object({
    newPassword: z.string().trim().min(8, { message: "errors.passwordMin" }),
    confirmPassword: z
      .string()
      .trim()
      .min(8, { message: "errors.passwordMin" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "errors.passwordMismatch",
    path: ["confirmPassword"],
  });

export type ConfirmResetValues = z.infer<typeof confirmResetSchema>;
export type ConfirmResetErrors = Partial<
  Record<keyof ConfirmResetValues, string>
>;
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "errors.emailRequired" })
    .email({ message: "errors.emailInvalid" }),
  code: z.string().length(6, { message: "errors.otpLength" }),
  newPassword: z.string().trim().min(8, { message: "errors.passwordMin" }),
});

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordErrors = Partial<
  Record<keyof ResetPasswordValues, string>
>;

export const emailVerificationSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "errors.emailRequired" })
    .email({ message: "errors.emailInvalid" }),
});

export type EmailVerificationValues = z.infer<typeof emailVerificationSchema>;
export type EmailVerificationErrors = Partial<
  Record<keyof EmailVerificationValues, string>
>;
