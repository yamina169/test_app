"use client";

import * as React from "react";
import { CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { LoginForm } from "./login-form";
import { LoginWithCard } from "./login-with-card";

type Tab = "email" | "carte";

export function LoginTabs() {
  const t = useTranslations("login");
  const [active, setActive] = React.useState<Tab>("email");
  const [announcement, setAnnouncement] = React.useState("");

  function switchTab(tab: Tab) {
    setActive(tab);
    setAnnouncement(
      tab === "email" ? t("tabs.emailActive") : t("tabs.carteActive"),
    );
  }

  return (
    <div>
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </span>

      <div
        role="tablist"
        aria-label={t("tabs.ariaLabel")}
        className="flex rounded-xl bg-muted p-1"
      >
        <button
          role="tab"
          id="tab-email"
          aria-selected={active === "email"}
          aria-controls="panel-email"
          onClick={() => switchTab("email")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-colors min-h-11",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            active === "email"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t("tabs.email")}
        </button>

        <button
          role="tab"
          id="tab-carte"
          aria-selected={active === "carte"}
          aria-controls="panel-carte"
          onClick={() => switchTab("carte")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-colors min-h-11",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            active === "carte"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          {t("tabs.carte")}
        </button>
      </div>

      <div
        role="tabpanel"
        id="panel-email"
        aria-labelledby="tab-email"
        hidden={active !== "email"}
      >
        <LoginForm />
      </div>

      <div
        role="tabpanel"
        id="panel-carte"
        aria-labelledby="tab-carte"
        hidden={active !== "carte"}
      >
        <LoginWithCard />
      </div>
    </div>
  );
}
