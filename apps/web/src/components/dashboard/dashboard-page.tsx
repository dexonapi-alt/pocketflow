"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useDashboardSummary, useDashboardChart, useTopCategories } from "@/hooks";
import { useTransactions } from "@/hooks/use-transactions";
import { ActionModal, type ModalType } from "@/components/shared";
import { BalanceCard } from "./balance-card";
import { CycleHealth } from "./cycle-health";
import { WeeklyChart } from "./weekly-chart";
import { ActivityPanel } from "./activity-panel";
import { SavingsForecast } from "./savings-forecast";

const emptySummary = {
  currentMoney: 0,
  savedMoney: 0,
  spentToday: 0,
  spentThisCycle: 0,
  remainingThisCycle: 0,
  monthlyIncome: 0,
  daysUntilPayday: 0,
  deltaVsLastCycle: null,
};

const emptyChart = [
  { day: "Mon", amount: 0 },
  { day: "Tue", amount: 0 },
  { day: "Wed", amount: 0 },
  { day: "Thu", amount: 0 },
  { day: "Fri", amount: 0 },
  { day: "Sat", amount: 0 },
  { day: "Sun", amount: 0 },
];

export function DashboardPage() {
  const [modalType, setModalType] = useState<ModalType>(null);

  const summaryQuery = useDashboardSummary();
  const chartQuery = useDashboardChart();
  const topCatQuery = useTopCategories();
  const txQuery = useTransactions({ limit: 5 });

  const isLoading = summaryQuery.isLoading && chartQuery.isLoading;

  const summary = summaryQuery.data?.data ?? emptySummary;
  const chartDaily = chartQuery.data?.data?.daily ?? emptyChart;
  const topCategories = topCatQuery.data?.data ?? [];
  const transactions = txQuery.data?.data?.data ?? [];

  const totalSpent = chartDaily.reduce((acc, d) => acc + d.amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-black/40">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <ActionModal open={modalType !== null} onClose={() => setModalType(null)} type={(modalType ?? "expense") as Exclude<ModalType, null>} />
      <div className="space-y-6">
        {/* ─── Row 1: Balance + Cycle Health ─── */}
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <BalanceCard
            currentMoney={summary.currentMoney}
            savedMoney={summary.savedMoney}
            spentToday={summary.spentToday}
            spentThisCycle={summary.spentThisCycle}
            daysUntilPayday={summary.daysUntilPayday}
            deltaVsLastCycle={summary.deltaVsLastCycle}
            onAddExpense={() => setModalType("expense")}
            onSaveMoney={() => setModalType("save")}
          />
          <CycleHealth
            currentMoney={summary.currentMoney}
            spentThisCycle={summary.spentThisCycle}
            savedMoney={summary.savedMoney}
            monthlyIncome={summary.monthlyIncome ?? 0}
          />
        </div>

        {/* ─── Row 2: Weekly Chart + Activity ─── */}
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <WeeklyChart daily={chartDaily} totalSpent={totalSpent} />
          <ActivityPanel transactions={transactions} topCategories={topCategories} />
        </div>

        {/* ─── Row 3: AI Savings Forecast ─── */}
        <SavingsForecast />
      </div>
    </>
  );
}
