// app/(auth)/login/page.tsx  — or wherever LoginStatic lives
"use client";

import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { LoginHeader } from "@/components/auth/login/login-header";
import { LoginTabs } from "@/components/auth/login/login-tabs";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl border border-border shadow-lg md:h-150">
        {/* Brand panel — desktop only */}
        <div className="hidden md:flex md:w-[45%]">
          <AuthBrandPanel className="h-full w-full" />
        </div>

        {/* Form panel */}
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
