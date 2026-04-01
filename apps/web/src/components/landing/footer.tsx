"use client";

import { Wallet } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-black/6 bg-[#fafaf7] py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 sm:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="text-[16px] font-semibold">PocketFlow</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-black/42">
              A salary-based financial planner with AI insights.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/38">Product</p>
            <div className="mt-3 space-y-2.5">
              {["Dashboard", "Transactions", "AI Chat", "Calendar", "Tasks"].map((l) => (
                <p key={l} className="text-sm text-black/50 hover:text-black cursor-pointer transition">{l}</p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/38">Plans</p>
            <div className="mt-3 space-y-2.5">
              {["Free", "Lite", "Plus", "Pro+"].map((l) => (
                <p key={l} className="text-sm text-black/50 hover:text-black cursor-pointer transition">{l}</p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/38">Legal</p>
            <div className="mt-3 space-y-2.5">
              {["Privacy Policy", "Terms of Service", "Contact"].map((l) => (
                <p key={l} className="text-sm text-black/50 hover:text-black cursor-pointer transition">{l}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-black/6 pt-6 text-center text-sm text-black/30">
          &copy; {new Date().getFullYear()} PocketFlow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
