import type {
  LoginWithEmailValues,
  LoginWithHandicapCardValues,
  ResetPasswordValues,
  EmailVerificationValues,
  RegisterValues,
  ConfirmResetValues,
} from "@/lib/schemas/auth.schema";
import type { PartialDeep } from "type-fest";

export const confirmResetInitialValues: ConfirmResetValues = {
  code: "",
  newPassword: "",
};

// confirmResetFieldIds — keep as-is if this form is always standalone
export const confirmResetFieldIds: Record<keyof ConfirmResetValues, string> = {
  code: "confirm-reset-code", // was "reset-code" — rename to avoid collision
  newPassword: "confirm-reset-newPassword",
};
export const loginInitialValues: LoginWithEmailValues = {
  email: "",
  password: "",
};

export const loginFieldIds: Record<keyof LoginWithEmailValues, string> = {
  email: "login-email",
  password: "login-password",
};

export const loginWithCardInitialValues: LoginWithHandicapCardValues = {
  handicapCardId: "",
};

export const loginWithCardFieldIds: Record<
  keyof LoginWithHandicapCardValues,
  string
> = {
  handicapCardId: "login-card-id",
};

export const registerInitialValues: PartialDeep<RegisterValues> = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  roleId: undefined,
  otpCode: "",
  handicapCardId: undefined,
  dateOfBirth: undefined,
  governorate: undefined,
  city: undefined,
  handicapType: undefined,
  requiredAccommodation: [],
  occupationStatus: undefined,
  caregiver: undefined,
  institutionName: "",
  institutionPhone: "",
  institutionEmail: "",
  institutionGovernorate: "",
  institutionCity: "",
  website: "",
  typeOfServices: [],
  accessible: undefined,
  specificEquipment: [],
};

export const registerFieldIds: Record<
  keyof typeof registerInitialValues,
  string
> = {
  fullName: "register-fullName",
  email: "register-email",
  phone: "register-phone",
  password: "register-password",
  roleId: "register-roleId",
  otpCode: "register-otpCode",
  handicapCardId: "register-handicapCardId",
  dateOfBirth: "register-dateOfBirth",
  governorate: "register-governorate",
  city: "register-city",
  handicapType: "register-handicapType",
  requiredAccommodation: "register-requiredAccommodation",
  occupationStatus: "register-occupationStatus",
  caregiver: "register-caregiver",
  institutionName: "register-institutionName",
  institutionPhone: "register-institutionPhone",
  institutionEmail: "register-institutionEmail",
  institutionGovernorate: "register-institutionGovernorate",
  institutionCity: "register-institutionCity",
  website: "register-website",
  typeOfServices: "register-typeOfServices",
  accessible: "register-accessible",
  specificEquipment: "register-specificEquipment",
};

export const resetPasswordInitialValues: ResetPasswordValues = {
  email: "",
  code: "",
  newPassword: "",
};

export const resetPasswordFieldIds: Record<keyof ResetPasswordValues, string> =
  {
    email: "reset-email",
    code: "reset-code",
    newPassword: "reset-newPassword",
  };

export const emailInitialValues: EmailVerificationValues = {
  email: "",
};

export const emailFieldIds: Record<keyof EmailVerificationValues, string> = {
  email: "email-email",
};
