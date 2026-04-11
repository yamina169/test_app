"use client";

import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { LoginHeader } from "@/components/auth/login/login-header";
import { LoginTabs } from "@/components/auth/login/login-tabs";
import { LanguageSwitcherDropdown } from "@/components/languageSwitcher/language-switcher-dropdown";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background p-4">
      <div className="flex justify-end mb-6 w-full max-w-5xl mx-auto">
        <LanguageSwitcherDropdown />
      </div>

      <div className="flex w-full max-w-5xl mx-auto overflow-hidden rounded-3xl border border-border shadow-lg md:h-150">
        <div className="hidden md:flex md:w-[45%]">
          <AuthBrandPanel />
        </div>

        <main
          id="main-content"
          className="flex w-full flex-col justify-center bg-card p-8 md:w-[55%] md:p-12"
        >
          <LoginHeader />
          <LoginTabs />
        </main>
      </div>
    </div>
  );
}
