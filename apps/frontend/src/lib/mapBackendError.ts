/** Maps raw backend error messages to i18n translation keys. */
const ERROR_MAP: Record<string, string> = {
  "Invalid credentials": "backendErrors.auth.invalidCredentials",
  "Email not confirmed": "backendErrors.auth.emailNotConfirmed",
  "Account inactive or suspended": "backendErrors.auth.accountSuspended",
  "Invalid handicap card": "backendErrors.auth.invalidHandicapCard",
  "Invalid or expired OTP code": "backendErrors.auth.otpInvalid",
  "OTP code has expired": "backendErrors.auth.otpExpired",
  "Incorrect OTP code": "backendErrors.auth.otpIncorrect",
  "Invalid or expired link": "backendErrors.auth.magicLinkExpired",
  "Email already in use": "backendErrors.auth.emailTaken",
  "Role not found": "backendErrors.auth.roleNotFound",
  "User not found": "backendErrors.auth.userNotFound",
  "At least one document is required": "backendErrors.auth.documentRequired",
  "Missing handicap profile fields": "backendErrors.auth.missingHandicapFields",
  "Duplicate files are not allowed": "backendErrors.auth.duplicateFiles",
};

type ClassifiedError =
  | { kind: "known"; key: string }
  | { kind: "network" }
  | { kind: "unknown" };

export function classifyError(error: unknown): ClassifiedError {
  const message = extractRawMessage(error);

  if (!message) return { kind: "unknown" };

  if (/failed to fetch|network|networkerror/i.test(message)) {
    return { kind: "network" };
  }

  const key = ERROR_MAP[message];
  if (key) return { kind: "known", key };

  return { kind: "unknown" };
}

function extractRawMessage(error: unknown): string | null {
  if (!error) return null;

  if (typeof error === "object" && "graphQLErrors" in error) {
    const gql = error as { graphQLErrors?: { message: string }[] };
    return gql.graphQLErrors?.[0]?.message ?? null;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return null;
}
