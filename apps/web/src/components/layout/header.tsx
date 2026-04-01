"use client";

import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  greeting?: string;
  title?: string;
  initials?: string;
}

export function Header({ greeting, title, initials }: HeaderProps) {
  const displayGreeting = greeting ?? getGreeting();
  const displayTitle = title ?? "Your money";
  const displayInitials = initials ?? "JD";

  return (
    <header className="sticky top-0 z-10 border-b border-black/6 bg-[#fbfbf8]/95 backdrop-blur">
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        <div>
          <p className="text-sm text-black/40">{displayGreeting}</p>
          <h2 className="text-[22px] font-semibold tracking-[-0.03em]">{displayTitle}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-2xl border border-black/8 bg-white px-3 py-2 md:flex">
            <Search className="h-4 w-4 text-black/35" />
            <span className="text-sm text-black/42">Search transactions</span>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/8 bg-white text-black/60 transition hover:bg-black/[0.02]">
            <Bell className="h-4 w-4" />
          </button>
          <Avatar className="h-10 w-10 border border-black/8">
            <AvatarFallback className="bg-[#f3f3f1] text-black">{displayInitials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
