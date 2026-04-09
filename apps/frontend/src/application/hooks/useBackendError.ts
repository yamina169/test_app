import { useTranslations } from "next-intl";
import { classifyError } from "@/lib/mapBackendError";

export function useBackendError() {
  const t = useTranslations();

  function resolveError(error: unknown): string {
    const classified = classifyError(error);

    switch (classified.kind) {
      case "known":
        return t(classified.key);
      case "network":
        return t("backendErrors.generic.network");
      default:
        return t("backendErrors.generic.unknown");
    }
  }

  return { resolveError };
}
