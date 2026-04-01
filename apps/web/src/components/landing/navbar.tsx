"use client";

import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function Navbar({ onGetStarted, onLogin }: NavbarProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-black/6 bg-[#fbfbf8]/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
            <Wallet className="h-4 w-4" />
          </div>
          <span className="text-[16px] font-semibold tracking-[-0.01em]">PocketFlow</span>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {[
            { label: "Features", id: "features" },
            { label: "Pricing", id: "pricing" },
            { label: "FAQ", id: "faq" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm text-black/50 transition hover:text-black"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={onLogin} className="text-sm font-medium text-black/60 transition hover:text-black">
            Sign in
          </button>
          <Button onClick={onGetStarted} className="h-9 rounded-xl bg-black px-4 text-sm text-white hover:bg-black/90">
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
}
