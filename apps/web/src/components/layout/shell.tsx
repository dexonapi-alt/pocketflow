"use client";

import { useState } from "react";
import { FloatingToast } from "./floating-toast";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export type PageKey = "auth" | "dashboard" | "transactions" | "calendar" | "tasks" | "chatbot" | "subscription" | "more";

interface ShellProps {
  page: PageKey;
  setPage: (page: PageKey) => void;
  children: React.ReactNode;
  authenticated: boolean;
  onLogout?: () => void;
  userInitials?: string;
}

export function Shell({ page, setPage, children, authenticated, onLogout, userInitials }: ShellProps) {
  const [showToast, setShowToast] = useState(true);

  return (
    <div className="min-h-screen text-black bg-[#fbfbf8]">
      <FloatingToast show={showToast && authenticated} />
      <div className="mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 lg:grid-cols-[248px_1fr]">
        <Sidebar
          page={page}
          setPage={setPage}
          onNavClick={() => setShowToast(false)}
          authenticated={authenticated}
          onLogout={onLogout}
        />

        <main className="flex min-h-screen flex-col">
          <Header initials={authenticated ? userInitials : undefined} />
          <div className="flex-1 px-5 py-6 sm:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
