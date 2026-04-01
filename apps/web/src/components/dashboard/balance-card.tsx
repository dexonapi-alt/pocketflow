"use client";

import { Plus, PiggyBank, Receipt, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/shared";
import { formatCurrency } from "@/lib/utils";

const iconWrap = "flex h-10 w-10 items-center justify-center rounded-2xl border border-black/6";
const mutedCard = "rounded-[24px] border border-black/6 bg-[#fcfcfb]";
const card = "rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)]";

const statCardDefs = [
  { key: "saved", label: "Saved", icon: PiggyBank, tone: "bg-[#eef7ff] text-[#2e7cd6]" },
  { key: "spentToday", label: "Spent today", icon: Receipt, tone: "bg-[#fff0f2] text-[#d4587b]" },
  { key: "spentThisCycle", label: "This cycle", icon: CalendarDays, tone: "bg-[#f4efff] text-[#7357d8]" },
] as const;

interface BalanceCardProps {
  currentMoney: number;
  savedMoney: number;
  spentToday: number;
  spentThisCycle: number;
  daysUntilPayday: number;
  deltaVsLastCycle: number | null;
  onAddExpense: () => void;
  onSaveMoney: () => void;
}

export function BalanceCard({
  currentMoney,
  savedMoney,
  spentToday,
  spentThisCycle,
  daysUntilPayday,
  deltaVsLastCycle,
  onAddExpense,
  onSaveMoney,
}: BalanceCardProps) {
  const statValues: Record<string, number> = {
    saved: savedMoney,
    spentToday,
    spentThisCycle,
  };

  const hasDelta = deltaVsLastCycle != null;
  const deltaText = hasDelta
    ? `${deltaVsLastCycle > 0 ? "+" : ""}${deltaVsLastCycle.toFixed(1)}%`
    : null;
  const deltaIsNegative = hasDelta && deltaVsLastCycle < 0;

  return (
    <Card className={card}>
      <CardContent className="p-6 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <SectionEyebrow>Available balance</SectionEyebrow>
            <h3 className="mt-2 text-[44px] font-semibold tracking-[-0.05em] text-black">
              {formatCurrency(currentMoney)}
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-black/56">
              {deltaText && (
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
                  deltaIsNegative ? "bg-[#fff0f2] text-[#d4587b]" : "bg-[#ecfaf1] text-[#27945c]"
                }`}>
                  {deltaText} vs last cycle
                </span>
              )}
              {daysUntilPayday > 0 && (
                <span>Next payday in {daysUntilPayday} days</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={onAddExpense} className="h-11 rounded-2xl bg-black px-5 text-white hover:bg-black/90">
              <Plus className="mr-2 h-4 w-4" /> Add expense
            </Button>
            <Button onClick={onSaveMoney} variant="outline" className="h-11 rounded-2xl border-black/10 bg-white px-5 text-black hover:bg-black/[0.03]">
              <PiggyBank className="mr-2 h-4 w-4 text-[#2e7cd6]" /> Save money
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {statCardDefs.map((stat) => {
            const Icon = stat.icon;
            const value = statValues[stat.key] ?? 0;
            return (
              <div key={stat.label} className={mutedCard}>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-black/44">{stat.label}</p>
                      <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em]">{formatCurrency(value)}</p>
                      <p className="mt-2 text-sm text-black/42">this period</p>
                    </div>
                    <div className={`${iconWrap} ${stat.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
