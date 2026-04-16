"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, Pin, X, Trash2, Receipt, Check,
  ShoppingBag, ArrowDownLeft, ArrowUpRight, DollarSign, Clock, Wallet,
  CalendarDays, AlertCircle, GripVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionEyebrow } from "@/components/shared";
import { usePlannerMonth, useCreateEvent, useDeleteEvent } from "@/hooks/use-planner";
import { useFixedExpenses, type FixedExpense } from "@/hooks/use-fixed-expenses";
import { useGoals, useUpdateGoal, type PurchaseGoal } from "@/hooks/use-goals";
import { useTransactions, useCreateTransaction, useDeleteTransaction } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useDashboardSummary } from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/utils";

const card = "rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)]";
const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const COLORS = ["#2e7cd6", "#27945c", "#df7b2d", "#7357d8", "#d4587b", "#d96f42"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type AddMode = "event" | "transaction" | null;

type CalendarMarker = {
  type: "event" | "transaction";
  color: string;
};

function getExpenseDaysForMonth(expenses: FixedExpense[], year: number, month: number): Map<number, FixedExpense[]> {
  const daysInMonth = new Date(year, month, 0).getDate();
  const map = new Map<number, FixedExpense[]>();

  for (const expense of expenses) {
    if (expense.frequency === "BIWEEKLY") {
      if (!expense.dueDate) continue;
      // Anchor on the due date in the month the expense was created,
      // then step every 14 days to find which dates land in the viewed month.
      const created = new Date(expense.createdAt);
      const anchorDay = Math.min(expense.dueDate, 28);
      const anchor = new Date(created.getFullYear(), created.getMonth(), anchorDay);

      const monthStart = new Date(year, month - 1, 1);
      const diffDays = Math.floor((monthStart.getTime() - anchor.getTime()) / 86_400_000);
      const startCycle = Math.floor(diffDays / 14);

      for (let c = startCycle - 1; c <= startCycle + 4; c++) {
        const d = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + c * 14);
        if (d.getFullYear() === year && d.getMonth() === month - 1) {
          const day = d.getDate();
          if (!map.has(day)) map.set(day, []);
          map.get(day)!.push(expense);
        }
      }
    } else {
      const day = Math.min(expense.dueDate ?? 1, daysInMonth);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(expense);
    }
  }
  return map;
}

function getGoalDaysForMonth(goals: PurchaseGoal[], year: number, month: number): Map<number, PurchaseGoal[]> {
  const map = new Map<number, PurchaseGoal[]>();
  for (const goal of goals) {
    if (!goal.estimatedDate || goal.isAchieved) continue;
    const d = new Date(goal.estimatedDate);
    if (d.getFullYear() === year && d.getMonth() + 1 === month) {
      const day = d.getDate();
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(goal);
    }
  }
  return map;
}

function getPaydayDaysForMonth(
  onboarding: { salaryFrequency: string; paydayDayOfMonth: number | null; nextPayday: string | null; salaryAmount: number } | null,
  year: number,
  month: number,
): number[] {
  if (!onboarding || Number(onboarding.salaryAmount) <= 0) return [];

  const daysInMonth = new Date(year, month, 0).getDate();

  if (onboarding.salaryFrequency === "BIWEEKLY") {
    // For biweekly salary, anchor from nextPayday or paydayDayOfMonth
    let anchor: Date;
    if (onboarding.nextPayday) {
      anchor = new Date(onboarding.nextPayday);
    } else if (onboarding.paydayDayOfMonth) {
      const day = Math.min(onboarding.paydayDayOfMonth, 28);
      anchor = new Date(year, month - 1, day);
    } else {
      return [];
    }

    const monthStart = new Date(year, month - 1, 1);
    const diffDays = Math.floor((monthStart.getTime() - anchor.getTime()) / 86_400_000);
    const startCycle = Math.floor(diffDays / 14);
    const days: number[] = [];

    for (let c = startCycle - 1; c <= startCycle + 4; c++) {
      const d = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + c * 14);
      if (d.getFullYear() === year && d.getMonth() === month - 1) {
        days.push(d.getDate());
      }
    }
    return days;
  }

  // Monthly salary
  if (onboarding.paydayDayOfMonth) {
    return [Math.min(onboarding.paydayDayOfMonth, daysInMonth)];
  }

  return [];
}

export function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Add forms
  const [addMode, setAddMode] = useState<AddMode>(null);

  // Event form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);

  // Transaction form state
  const [txType, setTxType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [txAmount, setTxAmount] = useState("");
  const [txNote, setTxNote] = useState("");
  const [txCategoryId, setTxCategoryId] = useState("");

  // Goal drag-and-drop + date warning modal + bought confirmation
  const [draggingGoalId, setDraggingGoalId] = useState<string | null>(null);
  const [goalWarning, setGoalWarning] = useState<{ goalName: string; minDate: string; balance: number } | null>(null);
  const [boughtConfirm, setBoughtConfirm] = useState<{ id: string; name: string; price: number } | null>(null);

  const eventsQuery = usePlannerMonth(year, month);
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();
  const fixedExpensesQuery = useFixedExpenses();
  const goalsQuery = useGoals();
  const updateGoal = useUpdateGoal();
  const categoriesQuery = useCategories();
  const onboardingQuery = useOnboarding();
  const dashboardQuery = useDashboardSummary();

  // Fetch transactions for the displayed month
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
  const txQuery = useTransactions({ startDate, endDate, limit: 100 });
  const createTx = useCreateTransaction();
  const deleteTx = useDeleteTransaction();

  const events = eventsQuery.data?.data ?? [];
  const fixedExpenses: FixedExpense[] = fixedExpensesQuery.data?.data ?? [];
  const purchaseGoals: PurchaseGoal[] = goalsQuery.data?.data ?? [];
  const transactions = txQuery.data?.data?.data ?? [];
  const categories = categoriesQuery.data?.data ?? [];

  const onboarding = onboardingQuery.data?.data ?? null;

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const filteredCategories = txType === "EXPENSE" ? expenseCategories : incomeCategories;

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const dim = new Date(year, month, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= dim; i++) days.push(i);
    return days;
  }, [year, month]);

  const eventsByDay = useMemo(() => {
    const map: Record<number, typeof events> = {};
    events.forEach((e) => {
      const d = new Date(e.date).getDate();
      if (!map[d]) map[d] = [];
      map[d].push(e);
    });
    return map;
  }, [events]);

  const txByDay = useMemo(() => {
    const map: Record<number, typeof transactions> = {};
    transactions.forEach((t) => {
      const d = new Date(t.transactionDate).getDate();
      if (!map[d]) map[d] = [];
      map[d].push(t);
    });
    return map;
  }, [transactions]);

  const expensesByDay = useMemo(
    () => getExpenseDaysForMonth(fixedExpenses, year, month),
    [fixedExpenses, year, month],
  );

  const goalsByDay = useMemo(
    () => getGoalDaysForMonth(purchaseGoals, year, month),
    [purchaseGoals, year, month],
  );

  const paydayDays = useMemo(
    () => new Set(getPaydayDaysForMonth(onboarding, year, month)),
    [onboarding, year, month],
  );

  const getMarkersForDay = (day: number) => {
    const dots: CalendarMarker[] = [];
    const dayEvents = eventsByDay[day] || [];
    for (const e of dayEvents.slice(0, 2)) {
      dots.push({ type: "event", color: e.color ?? "#2e7cd6" });
    }
    if ((txByDay[day] || []).length > 0) {
      const hasIncome = txByDay[day].some((t) => t.type === "INCOME");
      const hasExpense = txByDay[day].some((t) => t.type === "EXPENSE");
      if (hasExpense) dots.push({ type: "transaction", color: "#df7b2d" });
      if (hasIncome) dots.push({ type: "transaction", color: "#27945c" });
    }

    const hasBills = expensesByDay.has(day);
    const hasGoal = goalsByDay.has(day);
    const isPayday = paydayDays.has(day);

    return { dots: dots.slice(0, 3), hasBills, hasGoal, isPayday };
  };

  const selectedDay = selectedDate ? parseInt(selectedDate.split("-")[2]) : null;

  const selectedEvents = selectedDate
    ? events.filter((e) => new Date(e.date).toISOString().split("T")[0] === selectedDate)
    : [];

  const selectedTx = selectedDate
    ? transactions.filter((t) => new Date(t.transactionDate).toISOString().split("T")[0] === selectedDate)
    : [];

  const selectedExpenses = selectedDay ? (expensesByDay.get(selectedDay) ?? []) : [];
  const selectedGoals = selectedDay ? (goalsByDay.get(selectedDay) ?? []) : [];
  const isSelectedPayday = selectedDay ? paydayDays.has(selectedDay) : false;

  const currentMoney = dashboardQuery.data?.data?.currentMoney ?? null;

  const projectedBalance = useMemo(() => {
    if (currentMoney === null || !selectedDate || !onboarding) return null;

    // "today" = end of today so same-day selection returns null (shows current balance)
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const target = new Date(selectedDate + "T23:59:59");

    if (target <= todayEnd) return null;

    // "tomorrow" start — only count paydays/expenses/transactions strictly after today
    const tomorrowStart = new Date(); tomorrowStart.setHours(0, 0, 0, 0);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    let balance = currentMoney;

    // Add paydays between tomorrow and target
    const salary = Number(onboarding.salaryAmount);
    if (salary > 0) {
      const isBiweekly = onboarding.salaryFrequency === "BIWEEKLY";
      let anchor: Date;
      if (isBiweekly) {
        if (onboarding.nextPayday) {
          anchor = new Date(onboarding.nextPayday);
        } else if (onboarding.paydayDayOfMonth) {
          anchor = new Date(tomorrowStart.getFullYear(), tomorrowStart.getMonth(), Math.min(onboarding.paydayDayOfMonth, 28));
        } else {
          anchor = new Date(tomorrowStart);
        }
        while (anchor < tomorrowStart) anchor = new Date(anchor.getTime() + 14 * 86_400_000);
        const cursor = new Date(anchor);
        while (cursor <= target) {
          balance += salary;
          cursor.setTime(cursor.getTime() + 14 * 86_400_000);
        }
      } else {
        const payday = onboarding.paydayDayOfMonth ?? 1;
        const cursor = new Date(tomorrowStart.getFullYear(), tomorrowStart.getMonth(), Math.min(payday, 28));
        if (cursor < tomorrowStart) cursor.setMonth(cursor.getMonth() + 1);
        while (cursor <= target) {
          balance += salary;
          cursor.setMonth(cursor.getMonth() + 1);
        }
      }
    }

    // Subtract fixed expenses between tomorrow and target
    for (const fe of fixedExpenses) {
      const amt = Number(fe.amount);
      const isFeBiweekly = fe.frequency === "BIWEEKLY";
      if (isFeBiweekly) {
        let anchor = new Date(fe.createdAt);
        if (fe.dueDate) anchor.setDate(fe.dueDate);
        while (anchor < tomorrowStart) anchor = new Date(anchor.getTime() + 14 * 86_400_000);
        const cursor = new Date(anchor);
        while (cursor <= target) {
          balance -= amt;
          cursor.setTime(cursor.getTime() + 14 * 86_400_000);
        }
      } else {
        const day = fe.dueDate ?? new Date(fe.createdAt).getDate();
        const cursor = new Date(tomorrowStart.getFullYear(), tomorrowStart.getMonth(), Math.min(day, 28));
        if (cursor < tomorrowStart) cursor.setMonth(cursor.getMonth() + 1);
        while (cursor <= target) {
          balance -= amt;
          cursor.setMonth(cursor.getMonth() + 1);
        }
      }
    }

    // Add scheduled transactions (strictly after today, up to target)
    for (const t of transactions) {
      const txDate = new Date(t.transactionDate);
      if (txDate >= tomorrowStart && txDate <= target) {
        if (t.type === "INCOME") balance += Number(t.amount);
        else if (t.type === "EXPENSE") balance -= Number(t.amount);
        else if (t.type === "SAVE") balance -= Number(t.amount);
      }
    }

    return Math.round(balance);
  }, [currentMoney, selectedDate, onboarding, fixedExpenses, transactions]);

  const goMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setMonth(m);
    setYear(y);
    setSelectedDate(null);
    setAddMode(null);
  };

  const toggleAddMode = (mode: AddMode) => {
    setAddMode((prev) => (prev === mode ? null : mode));
  };

  const handleAddEvent = async () => {
    if (!newTitle || !selectedDate) return;
    await createEvent.mutateAsync({
      title: newTitle,
      description: newDesc || undefined,
      date: new Date(selectedDate).toISOString(),
      color: newColor,
      pinned: true,
    });
    setNewTitle("");
    setNewDesc("");
    setAddMode(null);
  };

  const handleAddTransaction = async () => {
    if (!selectedDate) return;
    const amount = parseFloat(txAmount);
    if (isNaN(amount) || amount <= 0) return;

    await createTx.mutateAsync({
      type: txType,
      amount,
      note: txNote || undefined,
      categoryId: txCategoryId || undefined,
      transactionDate: new Date(selectedDate + "T12:00:00").toISOString(),
    });

    await txQuery.refetch();

    setTxAmount("");
    setTxNote("");
    setTxCategoryId("");
  };

  const handleGoalDateChange = (goal: PurchaseGoal, newDateStr: string) => {
    if (!goal.minEstimatedDate) return;
    const newDate = new Date(newDateStr + "T12:00:00");
    const minDate = new Date(goal.minEstimatedDate);

    if (newDate < minDate) {
      const shortfall = goal.targetPrice - (goal.savingsPerPaycheck * (goal.paychecksToGoal ?? 0));
      setGoalWarning({
        goalName: goal.name,
        minDate: minDate.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }),
        balance: Math.round(shortfall),
      });
      return;
    }

    updateGoal.mutate({ id: goal.id, targetDate: newDate.toISOString() });
  };

  const handleGoalDrop = (goalId: string, dateStr: string) => {
    const goal = purchaseGoals.find((g) => g.id === goalId);
    if (!goal || goal.isAchieved) return;
    handleGoalDateChange(goal, dateStr);
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();

  const hasAnythingForDay =
    selectedEvents.length > 0 || selectedExpenses.length > 0 || selectedGoals.length > 0 || selectedTx.length > 0 || isSelectedPayday;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      {/* ─── Calendar Grid ─── */}
      <Card className={card}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <SectionEyebrow>Calendar</SectionEyebrow>
              <CardTitle className="mt-2">{MONTH_NAMES[month - 1]} {year}</CardTitle>
            </div>
            <div className="flex gap-2">
              <button onClick={() => goMonth(-1)} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/8 bg-white hover:bg-black/[0.02]">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => goMonth(1)} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/8 bg-white hover:bg-black/[0.02]">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-[5px] w-[5px] rounded-full bg-[#2e7cd6]" />
              <span className="text-xs text-black/38">Events</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-[5px] w-[5px] rounded-full bg-[#df7b2d]" />
              <span className="text-xs text-black/38">Expense</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-[5px] w-[5px] rounded-full bg-[#27945c]" />
              <span className="text-xs text-black/38">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-[4px] w-3 rounded-full bg-[#27945c]" />
              <span className="text-xs text-black/38">Payday</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-[4px] w-3 rounded-full bg-[#d4587b]" />
              <span className="text-xs text-black/38">Bills</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="rounded bg-[#f0ecff] px-1 text-[8px] font-semibold text-[#7357d8]">🎯</div>
              <span className="text-xs text-black/38">Goal</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-black/38">{d}</div>
            ))}
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const { dots, hasBills, hasGoal, isPayday } = getMarkersForDay(day);
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={day}
                  onClick={() => { setSelectedDate(dateStr); setAddMode(null); }}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("ring-2", "ring-[#7357d8]/40"); }}
                  onDragLeave={(e) => { e.currentTarget.classList.remove("ring-2", "ring-[#7357d8]/40"); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("ring-2", "ring-[#7357d8]/40");
                    const goalId = e.dataTransfer.getData("goalId");
                    if (goalId) handleGoalDrop(goalId, dateStr);
                  }}
                  className={`relative flex min-h-[72px] flex-col items-center justify-between rounded-2xl p-1.5 pb-2 transition ${
                    isSelected ? "bg-black text-white" : isToday(day) ? "bg-[#eef7ff] text-[#2e7cd6]" : "hover:bg-black/[0.03]"
                  }`}
                >
                  <span className={`text-sm font-medium ${isSelected ? "text-white" : ""}`}>{day}</span>

                  <div className="flex w-full flex-col items-center gap-1 mt-auto">
                    {dots.length > 0 && (
                      <div className="flex gap-1">
                        {dots.map((m, idx) => (
                          <div
                            key={idx}
                            className="h-[5px] w-[5px] rounded-full"
                            style={{ backgroundColor: isSelected ? "white" : m.color }}
                          />
                        ))}
                      </div>
                    )}

                    {isPayday && (
                      <div
                        className="h-[5px] w-[80%] rounded-full"
                        style={{ backgroundColor: isSelected ? "rgba(255,255,255,0.7)" : "#27945c" }}
                      />
                    )}

                    {hasBills && (
                      <div
                        className="h-[5px] w-[80%] rounded-full"
                        style={{ backgroundColor: isSelected ? "rgba(255,255,255,0.7)" : "#d4587b" }}
                      />
                    )}

                    {hasGoal && (() => {
                      const dayGoals = goalsByDay.get(day);
                      const goalName = dayGoals?.[0]?.name ?? "Goal";
                      const goalAchieved = dayGoals?.[0]?.isAchieved ?? false;
                      return (
                        <div
                          draggable={!goalAchieved}
                          onDragStart={(e) => {
                            if (dayGoals?.[0]) {
                              e.dataTransfer.setData("goalId", dayGoals[0].id);
                              setDraggingGoalId(dayGoals[0].id);
                            }
                          }}
                          onDragEnd={() => setDraggingGoalId(null)}
                          className={`w-[95%] rounded-md px-1 py-[1px] text-[8px] font-semibold leading-tight truncate text-center ${
                            !goalAchieved ? "cursor-grab active:cursor-grabbing" : ""
                          } ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : goalAchieved
                                ? "bg-[#ecfaf1] text-[#27945c]"
                                : "bg-[#f0ecff] text-[#7357d8]"
                          }`}
                          title={goalName}
                        >
                          {goalAchieved ? "✓ " : "🎯 "}{goalName}
                        </div>
                      );
                    })()}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── Day Detail Panel ─── */}
      <Card className={card}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <SectionEyebrow>{selectedDate ? "Day details" : "Select a date"}</SectionEyebrow>
              <CardTitle className="mt-2">
                {selectedDate
                  ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })
                  : "Planner"}
              </CardTitle>
            </div>
            {selectedDate && (
              <div className="flex gap-2">
                <Button
                  onClick={() => toggleAddMode("transaction")}
                  size="icon"
                  variant={addMode === "transaction" ? "default" : "outline"}
                  className={`h-10 w-10 rounded-2xl ${addMode === "transaction" ? "bg-black text-white" : "border-black/8"}`}
                  title="Add transaction"
                >
                  {addMode === "transaction" ? <X className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={() => toggleAddMode("event")}
                  size="icon"
                  variant={addMode === "event" ? "default" : "outline"}
                  className={`h-10 w-10 rounded-2xl ${addMode === "event" ? "bg-black text-white" : "border-black/8"}`}
                  title="Add event"
                >
                  {addMode === "event" ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* ─── Projected Balance ─── */}
          {selectedDate && projectedBalance !== null && (
            <div className="rounded-[22px] border border-black/6 bg-gradient-to-r from-[#f6f3ff]/60 to-[#eef7ff]/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f0ecff] text-[#7357d8]">
                    <Wallet className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-black/40">Projected balance</p>
                    <p className={`text-lg font-bold ${projectedBalance >= 0 ? "text-[#27945c]" : "text-[#d4587b]"}`}>
                      {formatCurrency(projectedBalance)}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-black/30 text-right max-w-[120px] leading-tight">
                  Today&apos;s money + income − expenses by this date
                </p>
              </div>
            </div>
          )}

          {selectedDate && projectedBalance === null && currentMoney !== null && (
            <div className="rounded-[22px] border border-black/6 bg-[#fcfcfb] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#ecfaf1] text-[#27945c]">
                  <Wallet className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-black/40">Current balance</p>
                  <p className="text-lg font-bold text-black">{formatCurrency(currentMoney)}</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── Add Transaction Form ─── */}
          <AnimatePresence>
            {addMode === "transaction" && selectedDate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-[22px] border border-black/8 bg-white p-5 shadow-sm space-y-4">
                  <p className="text-[15px] font-medium text-black">Add transaction</p>

                  {/* Type selector */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setTxType("EXPENSE"); setTxCategoryId(""); }}
                      className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-sm font-medium transition ${
                        txType === "EXPENSE" ? "border-[#d4587b] bg-[#fff1f0] text-[#d4587b]" : "border-black/6 bg-[#fcfcfb] text-black/50"
                      }`}
                    >
                      <ArrowUpRight className="h-4 w-4" /> Expense
                    </button>
                    <button
                      onClick={() => { setTxType("INCOME"); setTxCategoryId(""); }}
                      className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-sm font-medium transition ${
                        txType === "INCOME" ? "border-[#27945c] bg-[#ecfaf1] text-[#27945c]" : "border-black/6 bg-[#fcfcfb] text-black/50"
                      }`}
                    >
                      <ArrowDownLeft className="h-4 w-4" /> Income
                    </button>
                  </div>

                  <Input
                    className={inputClass}
                    placeholder="₱ Amount"
                    type="number"
                    step="0.01"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                  />

                  <Input
                    className={inputClass}
                    placeholder="Note (optional)"
                    value={txNote}
                    onChange={(e) => setTxNote(e.target.value)}
                  />

                  {filteredCategories.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-black/40">Category</p>
                      <div className="flex flex-wrap gap-2">
                        {filteredCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setTxCategoryId(txCategoryId === cat.id ? "" : cat.id)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                              txCategoryId === cat.id
                                ? "border-black bg-black text-white"
                                : "border-black/8 bg-[#fcfcfb] text-black/55 hover:border-black/15"
                            }`}
                          >
                            {cat.icon ? `${cat.icon} ` : ""}{cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleAddTransaction}
                    disabled={createTx.isPending}
                    className="h-11 w-full rounded-2xl bg-black text-white hover:bg-black/90"
                  >
                    {createTx.isPending ? "Saving..." : `Add ${txType === "EXPENSE" ? "expense" : "income"}`}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Add Event Form ─── */}
          <AnimatePresence>
            {addMode === "event" && selectedDate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-[22px] border border-black/8 bg-white p-5 shadow-sm space-y-4">
                  <p className="text-[15px] font-medium text-black">Pin event</p>
                  <Input className={inputClass} placeholder="Event title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                  <Input className={inputClass} placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                  <div className="flex items-center gap-2">
                    {COLORS.map((c) => (
                      <button key={c} onClick={() => setNewColor(c)} className={`h-7 w-7 rounded-full border-2 ${newColor === c ? "border-black" : "border-transparent"}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <Button onClick={handleAddEvent} disabled={createEvent.isPending} className="h-11 w-full rounded-2xl bg-black text-white">
                    {createEvent.isPending ? "Adding..." : "Pin to this date"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedDate && (
            <p className="py-8 text-center text-sm text-black/38">Click a date on the calendar to see or add events.</p>
          )}

          {selectedDate && !hasAnythingForDay && addMode === null && (
            <p className="py-8 text-center text-sm text-black/38">Nothing on this date. Use the buttons above to add an event or transaction.</p>
          )}

          {/* ─── Payday on this day ─── */}
          {isSelectedPayday && onboarding && (() => {
            const salaryAmt = Number(onboarding.salaryAmount);
            const alreadyReceived = selectedTx.some(
              (t) => t.type === "INCOME" && t.note === "Salary" && Math.abs(Number(t.amount) - salaryAmt) < 1,
            );
            const paydayDate = new Date(selectedDate + "T12:00:00");
            const isPast = paydayDate <= new Date();
            return (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-black/30">Payday</p>
                <div className={`rounded-[22px] border p-4 ${alreadyReceived ? "border-[#27945c]/20 bg-[#ecfaf1]/30" : "border-[#27945c]/15 bg-[#ecfaf1]/30"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${alreadyReceived ? "bg-[#27945c] text-white" : "bg-[#ecfaf1] text-[#27945c]"}`}>
                        {alreadyReceived ? <Check className="h-4 w-4" /> : <Wallet className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <p className="text-[15px] font-medium text-black">Salary</p>
                        <p className="text-sm text-black/42">
                          +{formatCurrency(salaryAmt)} · {onboarding.salaryFrequency === "BIWEEKLY" ? "Bi-weekly" : "Monthly"}
                        </p>
                      </div>
                    </div>
                    {alreadyReceived ? (
                      <span className="rounded-xl bg-[#ecfaf1] px-3 py-1.5 text-xs font-medium text-[#27945c]">Received</span>
                    ) : isPast ? (
                      <button
                        onClick={async () => {
                          await createTx.mutateAsync({
                            type: "INCOME",
                            amount: salaryAmt,
                            note: "Salary",
                            transactionDate: paydayDate.toISOString(),
                          });
                          await txQuery.refetch();
                        }}
                        disabled={createTx.isPending}
                        className="shrink-0 flex items-center gap-1.5 rounded-xl bg-[#27945c] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#1f8a50]"
                      >
                        <DollarSign className="h-3 w-3" /> Receive
                      </button>
                    ) : (
                      <span className="rounded-xl bg-black/[0.04] px-3 py-1.5 text-xs font-medium text-black/40">Upcoming</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ─── Transactions on this day ─── */}
          {selectedTx.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-black/30">Transactions</p>
              {selectedTx.map((t) => {
                const isIncome = t.type === "INCOME";
                const txDate = new Date(t.transactionDate);
                const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
                const isFuture = txDate > todayEnd;
                return (
                  <div key={t.id} className={`flex items-center justify-between rounded-[22px] border p-4 ${isFuture ? "border-dashed border-black/10 bg-black/[0.015]" : "border-black/6 bg-[#fcfcfb]"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isIncome ? "bg-[#ecfaf1] text-[#27945c]" : "bg-[#fff1f0] text-[#d4587b]"}`}>
                        {isIncome ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[15px] font-medium text-black">
                            {t.note || t.merchantName || t.category?.name || (isIncome ? "Income" : "Expense")}
                          </p>
                          {isFuture && (
                            <Badge className="rounded-full border-0 bg-[#fff4e8] px-2 py-0.5 text-[11px] text-[#df7b2d] hover:bg-[#fff4e8]">
                              <Clock className="mr-1 h-3 w-3" /> Scheduled
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-black/42">
                          {t.category?.name && <span>{t.category.icon ? `${t.category.icon} ` : ""}{t.category.name} · </span>}
                          {isIncome ? "+" : "-"}{formatCurrency(Number(t.amount))}
                          {isFuture && <span className="text-black/30"> · won't count until this date</span>}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTx.mutate(t.id)}
                      className="rounded-xl p-2 text-black/30 hover:bg-black/[0.04] hover:text-[#d4587b]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── Fixed Expenses on this day ─── */}
          {selectedExpenses.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-black/30">Bills due</p>
              {selectedExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center gap-3 rounded-[22px] border border-[#d4587b]/15 bg-[#fff1f0]/30 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#fff1f0] text-[#d4587b]">
                    <Receipt className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-black">{expense.name}</p>
                    <p className="text-sm text-black/42">
                      {formatCurrency(Number(expense.amount))} · {expense.frequency === "BIWEEKLY" ? "Bi-weekly" : "Monthly"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── Goal targets on this day ─── */}
          {selectedGoals.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-black/30">Goal target date</p>
              {selectedGoals.map((goal) => {
                const currentDateVal = goal.estimatedDate
                  ? new Date(goal.estimatedDate).toISOString().split("T")[0]
                  : "";
                const minDateVal = goal.minEstimatedDate
                  ? new Date(goal.minEstimatedDate).toISOString().split("T")[0]
                  : "";
                const hasCustomDate = goal.targetDate !== null;

                return (
                  <div key={goal.id} className={`rounded-[22px] border p-4 ${goal.isAchieved ? "border-[#27945c]/20 bg-[#ecfaf1]/30" : "border-[#7357d8]/15 bg-[#f6f3ff]/30"}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${goal.isAchieved ? "bg-[#ecfaf1] text-[#27945c]" : "bg-[#f6f3ff] text-[#7357d8]"}`}>
                          {goal.isAchieved ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[15px] font-semibold ${goal.isAchieved ? "text-[#27945c] line-through" : "text-black"}`}>{goal.name}</p>
                          <p className="mt-0.5 text-sm font-medium text-black/50">
                            Target: {formatCurrency(goal.targetPrice)}
                          </p>
                          {goal.projectedBalanceAfter !== null && !goal.isAchieved && (
                            <p className="mt-1 text-sm text-[#27945c] font-medium">
                              Balance after purchase: {formatCurrency(goal.projectedBalanceAfter)}
                            </p>
                          )}
                          {goal.isAchieved && (
                            <p className="mt-1 text-sm font-medium text-[#27945c]">Purchased!</p>
                          )}
                        </div>
                      </div>
                      {!goal.isAchieved && (
                        <button
                          onClick={() => setBoughtConfirm({ id: goal.id, name: goal.name, price: goal.targetPrice })}
                          disabled={updateGoal.isPending}
                          className="shrink-0 flex items-center gap-1.5 rounded-xl bg-[#7357d8] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#6347c8]"
                        >
                          <Check className="h-3 w-3" /> Bought it
                        </button>
                      )}
                    </div>

                    {!goal.isAchieved && goal.minEstimatedDate && (
                      <div className="mt-3 space-y-2 border-t border-black/6 pt-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-black/30" />
                          <p className="text-xs font-medium text-black/40">Adjust target date</p>
                          <p className="text-[10px] text-black/30 ml-auto">or drag the bar on calendar</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={currentDateVal}
                            min={minDateVal}
                            onChange={(e) => handleGoalDateChange(goal, e.target.value)}
                            className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#7357d8]/30"
                          />
                          {hasCustomDate && (
                            <button
                              onClick={() => updateGoal.mutate({ id: goal.id, targetDate: null })}
                              className="rounded-xl border border-black/8 px-2.5 py-2 text-xs font-medium text-black/50 transition hover:bg-black/[0.03] hover:text-black/70"
                              title="Reset to earliest possible date"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── Planner Events ─── */}
          {selectedEvents.length > 0 && (
            <div className="space-y-2">
              {(selectedExpenses.length > 0 || selectedGoals.length > 0 || selectedTx.length > 0) && (
                <p className="text-xs font-medium uppercase tracking-wider text-black/30">Events</p>
              )}
              {selectedEvents.map((e) => (
                <div key={e.id} className="flex items-start justify-between rounded-[22px] border border-black/6 bg-[#fcfcfb] p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: e.color ?? "#2e7cd6" }} />
                    <div>
                      <p className="text-[15px] font-medium text-black">{e.title}</p>
                      {e.description && <p className="mt-1 text-sm text-black/42">{e.description}</p>}
                      {e.pinned && (
                        <Badge className="mt-2 rounded-full border-0 bg-[#fff4e8] px-2 py-0.5 text-[11px] text-[#df7b2d]">
                          <Pin className="mr-1 h-3 w-3" /> Pinned
                        </Badge>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteEvent.mutate(e.id)} className="rounded-xl p-2 text-black/30 hover:bg-black/[0.04] hover:text-[#d4587b]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Bought Confirmation Modal ─── */}
      <AnimatePresence>
        {boughtConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setBoughtConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-[22px] border border-black/6 bg-white p-6 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f0ecff] text-[#7357d8]">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-black">Mark as purchased?</p>
                  <p className="mt-0.5 text-sm text-black/50">
                    {boughtConfirm.name} · {formatCurrency(boughtConfirm.price)}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2.5">
                <button
                  onClick={async () => {
                    const { id, name, price } = boughtConfirm;
                    await createTx.mutateAsync({
                      type: "EXPENSE",
                      amount: price,
                      note: `Purchased: ${name}`,
                      transactionDate: new Date().toISOString(),
                    });
                    updateGoal.mutate({ id, isAchieved: true });
                    await txQuery.refetch();
                    setBoughtConfirm(null);
                  }}
                  disabled={createTx.isPending || updateGoal.isPending}
                  className="h-11 w-full rounded-2xl bg-[#7357d8] text-sm font-medium text-white transition hover:bg-[#6347c8]"
                >
                  Yes, deduct {formatCurrency(boughtConfirm.price)} from my balance
                </button>
                <button
                  onClick={() => {
                    updateGoal.mutate({ id: boughtConfirm.id, isAchieved: true });
                    setBoughtConfirm(null);
                  }}
                  disabled={updateGoal.isPending}
                  className="h-11 w-full rounded-2xl border border-black/8 text-sm font-medium text-black/60 transition hover:bg-black/[0.03]"
                >
                  Don&apos;t deduct, just mark as bought
                </button>
                <button
                  onClick={() => setBoughtConfirm(null)}
                  className="h-9 w-full text-sm text-black/35 transition hover:text-black/50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Goal Date Warning Modal ─── */}
      <AnimatePresence>
        {goalWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setGoalWarning(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-[22px] border border-black/6 bg-white p-6 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fff0f2] text-[#d4587b]">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-black">Can&apos;t move earlier</p>
                  <p className="mt-0.5 text-sm text-black/50">Not enough savings by that date</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-[#fff0f2]/50 border border-[#d4587b]/10 p-3">
                <p className="text-sm text-black/60">
                  <span className="font-semibold text-black">{goalWarning.goalName}</span> requires more time to save.
                  The earliest possible date is <span className="font-semibold text-[#7357d8]">{goalWarning.minDate}</span>.
                </p>
              </div>
              <button
                onClick={() => setGoalWarning(null)}
                className="mt-4 h-11 w-full rounded-2xl bg-black text-sm font-medium text-white transition hover:bg-black/90"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
