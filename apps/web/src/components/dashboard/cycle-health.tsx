"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionEyebrow } from "@/components/shared";
import { formatCurrency } from "@/lib/utils";

const card = "rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)]";

interface CycleHealthProps {
  currentMoney: number;
  spentThisCycle: number;
  savedMoney: number;
  monthlyIncome: number;
}

export function CycleHealth({ currentMoney, spentThisCycle, savedMoney, monthlyIncome }: CycleHealthProps) {
  const safeToSpend = Math.max(0, currentMoney);
  const isHealthy = currentMoney > 0;
  const statusLabel = isHealthy ? "Very stable" : currentMoney === 0 ? "Neutral" : "Tight";
  const statusBadge = isHealthy ? "Healthy" : currentMoney === 0 ? "Even" : "Watch it";
  const badgeBg = isHealthy ? "bg-[#f4efff] text-[#7357d8]" : "bg-[#fff0f2] text-[#d4587b]";

  const savingsRate = monthlyIncome > 0
    ? Math.round((savedMoney / monthlyIncome) * 100)
    : 0;
  const savingsPace = savedMoney === 0
    ? "Not started"
    : savingsRate >= 20 ? "Great" : savingsRate >= 10 ? "On track" : "Slow";

  const rows = [
    ["Safe to spend", formatCurrency(safeToSpend)],
    ["Spent this cycle", formatCurrency(spentThisCycle)],
    ["Savings pace", savingsPace],
  ];

  return (
    <Card className={card}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <SectionEyebrow>Cycle health</SectionEyebrow>
            <h4 className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">{statusLabel}</h4>
          </div>
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${badgeBg}`}>{statusBadge}</div>
        </div>

        <div className="mt-6 space-y-4">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b border-black/6 pb-3 last:border-0 last:pb-0">
              <p className="text-sm text-black/46">{k}</p>
              <p className="text-sm font-medium text-black">{v}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
