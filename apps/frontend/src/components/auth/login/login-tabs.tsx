// components/auth/login/login-tabs.tsx
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

  /*
    WCAG 4.1.3: aria-live region announces the active tab change
    to screen readers without stealing focus from the tab button.
  */
  const [announcement, setAnnouncement] = React.useState("");

  function switchTab(tab: Tab) {
    setActive(tab);
    // WCAG 4.1.3: polite live region — announced after current speech finishes
    setAnnouncement(
      tab === "email" ? t("tabs.emailActive") : t("tabs.carteActive"),
    );
  }

  return (
    <div>
      {/* WCAG 4.1.3: visually hidden live region for tab switch announcements */}
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </span>

      {/*
        WCAG 4.1.2: role="tablist" + role="tab" give the browser and AT
        the correct semantics for a tab widget.
        WCAG 2.1.1: keyboard navigation is handled natively by the browser
        for button elements (Tab + Enter/Space).
      */}
      <div
        role="tablist"
        aria-label={t("tabs.ariaLabel")}
        className="flex rounded-xl bg-muted p-1"
      >
        <button
          role="tab"
          id="tab-email"
          // WCAG 4.1.2: aria-selected communicates active state to screen readers
          aria-selected={active === "email"}
          aria-controls="panel-email"
          onClick={() => switchTab("email")}
          // WCAG 2.4.7: focus-visible ensures keyboard users see the focused tab
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
          {/* aria-hidden: icon is decorative — tab label conveys full meaning */}
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          {t("tabs.carte")}
        </button>
      </div>

      {/*
        WCAG 4.1.2: role="tabpanel" paired with aria-labelledby points back
        to its controlling tab for correct AT reading order.
        `hidden` attribute (not CSS display:none) ensures the inactive panel
        is fully removed from the accessibility tree.
      */}
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
