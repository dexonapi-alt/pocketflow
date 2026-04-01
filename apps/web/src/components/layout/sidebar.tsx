"use client";

import {
  Wallet,
  Home,
  Receipt,
  MoreHorizontal,
  Sparkles,
  ArrowRight,
  Loader2,
  LogOut,
  CalendarDays,
  ListTodo,
  MessageCircle,
  Crown,
} from "lucide-react";
import { useWeeklyPulse } from "@/hooks/use-ai";
import type { PageKey } from "./shell";

const nav = [
  { key: "dashboard" as PageKey, label: "Dashboard", icon: Home },
  { key: "transactions" as PageKey, label: "Transactions", icon: Receipt },
  { key: "calendar" as PageKey, label: "Calendar", icon: CalendarDays },
  { key: "tasks" as PageKey, label: "Tasks", icon: ListTodo },
  { key: "chatbot" as PageKey, label: "AI Chat", icon: MessageCircle },
  { key: "subscription" as PageKey, label: "Plans", icon: Crown },
  { key: "more" as PageKey, label: "More", icon: MoreHorizontal },
];

interface SidebarProps {
  page: PageKey;
  setPage: (page: PageKey) => void;
  onNavClick?: () => void;
  authenticated: boolean;
  onLogout?: () => void;
}

export function Sidebar({ page, setPage, onNavClick, authenticated, onLogout }: SidebarProps) {
  const pulseQuery = useWeeklyPulse();
  const aiText = pulseQuery.data?.data?.tip ?? null;
  const aiLoading = pulseQuery.isLoading;

  return (
    <aside className="hidden border-r border-black/6 bg-[#fafaf7] lg:flex lg:flex-col">
      {/* ─── Logo ─── */}
      <div className="px-6 pb-5 pt-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-black/34">PocketFlow</p>
            <h1 className="text-[18px] font-semibold tracking-[-0.02em]">Financial planner</h1>
          </div>
        </div>
      </div>

      {/* ─── Nav ─── */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {authenticated &&
          nav.map((item) => {
            const Icon = item.icon;
            const active = item.key === page;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setPage(item.key);
                  onNavClick?.();
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-[14px] font-medium transition ${
                  active ? "bg-white text-black shadow-[0_8px_20px_rgba(0,0,0,0.04)]" : "text-black/55 hover:bg-white/70"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-black" : "text-black/40"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

        {authenticated && (
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-[14px] font-medium text-black/55 hover:bg-white/70 transition mt-1"
          >
            <LogOut className="h-4 w-4 text-black/40" />
            <span>Sign out</span>
          </button>
        )}
      </nav>

      {/* ─── Weekly Pulse ─── */}
      {authenticated && (
        <div className="p-4">
          <div className="rounded-[26px] border border-black/6 bg-white p-4 shadow-[0_16px_34px_rgba(0,0,0,0.04)]">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6f3ff] text-[#7357d8]">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Weekly pulse</p>
                <p className="text-[11px] text-black/40">AI overview</p>
              </div>
            </div>
            {aiLoading ? (
              <div className="flex items-center gap-2 text-sm text-black/42">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Analyzing...
              </div>
            ) : aiText ? (
              <p className="text-[13px] leading-5 text-black/58">{aiText}</p>
            ) : (
              <p className="text-[13px] leading-5 text-black/42">Add transactions for tips.</p>
            )}
            <button onClick={() => {}} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-black">
              Open insights <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
