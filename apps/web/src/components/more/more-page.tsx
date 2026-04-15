"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Target, Sparkles, ChevronRight, Check, X, Pencil,
  Plus, Trash2, Receipt, ShoppingBag, CalendarDays, ShieldCheck, Minus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionEyebrow } from "@/components/shared";
import { useSavingsGoals } from "@/hooks/use-savings-goals";
import { useOnboarding } from "@/hooks/use-onboarding";
import {
  useFixedExpenses,
  useCreateFixedExpense,
  useUpdateFixedExpense,
  useDeleteFixedExpense,
} from "@/hooks/use-fixed-expenses";
import {
  useGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  type PurchaseGoal,
} from "@/hooks/use-goals";
import { apiPatch } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

const card = "rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)]";
const iconWrap = "flex h-10 w-10 items-center justify-center rounded-2xl border border-black/6";
const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

const goalTones = ["bg-[#2e7cd6]", "bg-[#df7b2d]", "bg-[#7357d8]", "bg-[#27945c]", "bg-[#d4587b]"];

function formatEstimatedDate(iso: string | null): string {
  if (!iso) return "Not achievable yet";
  return new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
}

export function MorePage() {
  const savingsGoalsQuery = useSavingsGoals();
  const onboardingQuery = useOnboarding();
  const fixedExpensesQuery = useFixedExpenses();
  const goalsQuery = useGoals();

  // Salary editor state
  const [editingSalary, setEditingSalary] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editFreq, setEditFreq] = useState<"MONTHLY" | "BIWEEKLY">("MONTHLY");
  const [saving, setSaving] = useState(false);

  // Fixed expense form state
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseFreq, setNewExpenseFreq] = useState<"MONTHLY" | "BIWEEKLY">("MONTHLY");
  const [newExpenseDueDate, setNewExpenseDueDate] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editExpenseName, setEditExpenseName] = useState("");
  const [editExpenseAmount, setEditExpenseAmount] = useState("");
  const [editExpenseFreq, setEditExpenseFreq] = useState<"MONTHLY" | "BIWEEKLY">("MONTHLY");
  const [editExpenseDueDate, setEditExpenseDueDate] = useState("");

  // Emergency fund state
  const [emergencyMonths, setEmergencyMonths] = useState(6);

  // Purchase goal form state
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalPrice, setNewGoalPrice] = useState("");
  const [newGoalNotes, setNewGoalNotes] = useState("");
  const [newGoalAddToTasks, setNewGoalAddToTasks] = useState(false);

  const createExpense = useCreateFixedExpense();
  const updateExpense = useUpdateFixedExpense();
  const deleteExpense = useDeleteFixedExpense();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const onboarding = onboardingQuery.data?.data;
  const fixedExpenses = fixedExpensesQuery.data?.data ?? [];
  const purchaseGoals: PurchaseGoal[] = goalsQuery.data?.data ?? [];

  const totalFixed = fixedExpenses.reduce((acc, e) => {
    const amt = Number(e.amount);
    return acc + (e.frequency === "BIWEEKLY" ? amt * 26 / 12 : amt);
  }, 0);

  const openSalaryEditor = () => {
    setEditAmount(onboarding ? String(Number(onboarding.salaryAmount)) : "");
    setEditFreq((onboarding?.salaryFrequency as any) ?? "MONTHLY");
    setEditingSalary(true);
  };

  const saveSalary = async () => {
    setSaving(true);
    try {
      await apiPatch("/onboarding", {
        salaryAmount: parseFloat(editAmount) || 0,
        salaryFrequency: editFreq,
      });
      onboardingQuery.refetch();
      setEditingSalary(false);
    } catch {}
    setSaving(false);
  };

  const handleAddExpense = () => {
    const amount = parseFloat(newExpenseAmount);
    if (!newExpenseName.trim() || !amount || amount <= 0) return;
    const dueDate = parseInt(newExpenseDueDate);
    createExpense.mutate(
      {
        name: newExpenseName.trim(),
        amount,
        frequency: newExpenseFreq,
        dueDate: dueDate >= 1 && dueDate <= 31 ? dueDate : undefined,
      },
      {
        onSuccess: () => {
          setNewExpenseName("");
          setNewExpenseAmount("");
          setNewExpenseFreq("MONTHLY");
          setNewExpenseDueDate("");
          setShowAddExpense(false);
        },
      },
    );
  };

  const startEditExpense = (expense: { id: string; name: string; amount: number; frequency: string; dueDate: number | null }) => {
    setEditingExpenseId(expense.id);
    setEditExpenseName(expense.name);
    setEditExpenseAmount(String(expense.amount));
    setEditExpenseFreq(expense.frequency as "MONTHLY" | "BIWEEKLY");
    setEditExpenseDueDate(expense.dueDate ? String(expense.dueDate) : "");
  };

  const handleUpdateExpense = () => {
    if (!editingExpenseId) return;
    const amount = parseFloat(editExpenseAmount);
    if (!editExpenseName.trim() || !amount || amount <= 0) return;
    const dueDate = parseInt(editExpenseDueDate);
    updateExpense.mutate(
      {
        id: editingExpenseId,
        name: editExpenseName.trim(),
        amount,
        frequency: editExpenseFreq,
        dueDate: dueDate >= 1 && dueDate <= 31 ? dueDate : null,
      },
      { onSuccess: () => setEditingExpenseId(null) },
    );
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense.mutate(id);
  };

  const handleAddGoal = () => {
    const price = parseFloat(newGoalPrice);
    if (!newGoalName.trim() || !price || price <= 0) return;
    createGoal.mutate(
      {
        name: newGoalName.trim(),
        targetPrice: price,
        notes: newGoalNotes.trim() || undefined,
        addToTasks: newGoalAddToTasks || undefined,
      },
      {
        onSuccess: () => {
          setNewGoalName("");
          setNewGoalPrice("");
          setNewGoalNotes("");
          setNewGoalAddToTasks(false);
          setShowAddGoal(false);
        },
      },
    );
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal.mutate(id);
  };

  const handleToggleAchieved = (goal: PurchaseGoal) => {
    updateGoal.mutate({ id: goal.id, isAchieved: !goal.isAchieved });
  };

  const salaryNote = onboarding
    ? Number(onboarding.salaryAmount) > 0
      ? `${formatCurrency(Number(onboarding.salaryAmount))} · ${onboarding.salaryFrequency === "BIWEEKLY" ? "Biweekly" : "Monthly"}`
      : "No salary set"
    : "Not set up yet";

  const nextPayday = onboarding?.nextPayday
    ? new Date(onboarding.nextPayday).toLocaleDateString("en-PH", { month: "long", day: "numeric" })
    : onboarding?.paydayDayOfMonth
      ? `Day ${onboarding.paydayDayOfMonth} each month`
      : null;

  const settingsItems = [
    { key: "salary", title: "Salary plan", note: salaryNote, icon: CreditCard, tone: "bg-[#f4efff] text-[#7357d8]", editable: true },
    { key: "goals", title: "Savings goals", note: `${savingsGoalsQuery.data?.data?.length ?? 0} active goals`, icon: Target, tone: "bg-[#eef7ff] text-[#2e7cd6]", editable: false },
    { key: "ai", title: "AI coach", note: "Weekly tips enabled", icon: Sparkles, tone: "bg-[#fff4e8] text-[#df7b2d]", editable: false },
  ];

  const apiSavingsGoals = savingsGoalsQuery.data?.data;
  const savingsGoals = apiSavingsGoals && apiSavingsGoals.length > 0
    ? apiSavingsGoals.map((g, i) => ({
        id: g.id,
        name: g.name,
        currentAmount: Number(g.currentAmount),
        targetAmount: Number(g.targetAmount),
        pct: Number(g.targetAmount) > 0 ? Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100) : 0,
        tone: goalTones[i % goalTones.length],
      }))
    : [];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      {/* ─── Left Column ─── */}
      <div className="space-y-6">
        {/* ─── Profile & Settings ─── */}
        <Card className={card}>
          <CardHeader>
            <SectionEyebrow>Profile</SectionEyebrow>
            <CardTitle className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">Profile & settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => item.key === "salary" && openSalaryEditor()}
                  className="flex w-full items-center justify-between rounded-[22px] border border-black/6 bg-[#fcfcfb] p-4 text-left transition hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className={`${iconWrap} ${item.tone}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-black">{item.title}</p>
                      <p className="mt-1 text-sm text-black/42">{item.note}</p>
                    </div>
                  </div>
                  {item.editable ? <Pencil className="h-4 w-4 text-black/28" /> : <ChevronRight className="h-4 w-4 text-black/28" />}
                </button>
              );
            })}

            {nextPayday && (
              <div className="rounded-[22px] border border-black/6 bg-[#ecfaf1]/40 p-4">
                <p className="text-sm text-[#27945c] font-medium">Next payday: {nextPayday}</p>
              </div>
            )}

            <AnimatePresence>
              {editingSalary && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-[22px] border border-black/8 bg-white p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[15px] font-medium text-black">Edit salary</p>
                      <button onClick={() => setEditingSalary(false)} className="text-black/30 hover:text-black">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <Input
                      className={inputClass}
                      placeholder="₱ Salary amount"
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      {(["MONTHLY", "BIWEEKLY"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setEditFreq(f)}
                          className={`rounded-2xl border p-3 text-sm font-medium transition ${
                            editFreq === f ? "border-black bg-black/[0.02]" : "border-black/6 bg-[#fcfcfb]"
                          }`}
                        >
                          {f === "MONTHLY" ? "Monthly" : "Biweekly"}
                        </button>
                      ))}
                    </div>
                    <Button onClick={saveSalary} disabled={saving} className="h-11 w-full rounded-2xl bg-black text-white hover:bg-black/90">
                      <Check className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* ─── Fixed Expenses ─── */}
        <Card className={card}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <SectionEyebrow>Recurring bills</SectionEyebrow>
                <CardTitle className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">Fixed expenses</CardTitle>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1f0] text-[#d4587b]">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {fixedExpenses.length > 0 && (
              <div className="rounded-[22px] border border-black/6 bg-[#fcfcfb] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-black/42">Total monthly equivalent</p>
                  <p className="text-[20px] font-semibold tracking-[-0.03em]">{formatCurrency(totalFixed)}</p>
                </div>
              </div>
            )}

            {fixedExpenses.map((expense) => (
              <div key={expense.id}>
                {editingExpenseId === expense.id ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-[22px] border border-black/8 bg-white p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-black">Edit expense</p>
                      <button onClick={() => setEditingExpenseId(null)} className="text-black/30 hover:text-black">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <Input
                      className={inputClass}
                      placeholder="Expense name"
                      value={editExpenseName}
                      onChange={(e) => setEditExpenseName(e.target.value)}
                    />
                    <Input
                      className={inputClass}
                      placeholder="₱ Amount"
                      type="number"
                      value={editExpenseAmount}
                      onChange={(e) => setEditExpenseAmount(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      {(["MONTHLY", "BIWEEKLY"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setEditExpenseFreq(f)}
                          className={`rounded-2xl border p-3 text-sm font-medium transition ${
                            editExpenseFreq === f ? "border-black bg-black/[0.02]" : "border-black/6 bg-[#fcfcfb]"
                          }`}
                        >
                          {f === "MONTHLY" ? "Monthly" : "Bi-weekly"}
                        </button>
                      ))}
                    </div>
                    <Input
                      className={inputClass}
                      placeholder="Due date (day 1-31, optional)"
                      type="number"
                      min={1}
                      max={31}
                      value={editExpenseDueDate}
                      onChange={(e) => setEditExpenseDueDate(e.target.value)}
                    />
                    <Button
                      onClick={handleUpdateExpense}
                      disabled={updateExpense.isPending}
                      className="h-11 w-full rounded-2xl bg-black text-white hover:bg-black/90"
                    >
                      <Check className="mr-2 h-4 w-4" /> {updateExpense.isPending ? "Saving..." : "Save"}
                    </Button>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-between rounded-[22px] border border-black/6 bg-[#fcfcfb] p-4">
                    <div className="flex items-center gap-3">
                      <div className={`${iconWrap} bg-[#fff1f0] text-[#d4587b]`}>
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[15px] font-medium text-black">{expense.name}</p>
                        <p className="mt-0.5 text-sm text-black/42">
                          {formatCurrency(Number(expense.amount))}/{expense.frequency === "BIWEEKLY" ? "bi-wk" : "mo"}
                          {expense.dueDate ? ` · Due day ${expense.dueDate}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditExpense({ id: expense.id, name: expense.name, amount: Number(expense.amount), frequency: expense.frequency, dueDate: expense.dueDate })}
                        className="rounded-xl p-2 text-black/28 transition hover:bg-black/4 hover:text-black/60"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="rounded-xl p-2 text-black/28 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {fixedExpenses.length === 0 && !showAddExpense && (
              <p className="py-6 text-center text-sm text-black/38">
                No fixed expenses yet. Add your monthly or bi-weekly bills.
              </p>
            )}

            <AnimatePresence>
              {showAddExpense && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-[22px] border border-black/8 bg-white p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[15px] font-medium text-black">New fixed expense</p>
                      <button onClick={() => setShowAddExpense(false)} className="text-black/30 hover:text-black">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <Input
                      className={inputClass}
                      placeholder="e.g. Internet bill, Rent, Netflix"
                      value={newExpenseName}
                      onChange={(e) => setNewExpenseName(e.target.value)}
                    />
                    <Input
                      className={inputClass}
                      placeholder="₱ Amount"
                      type="number"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      {(["MONTHLY", "BIWEEKLY"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setNewExpenseFreq(f)}
                          className={`rounded-2xl border p-3 text-sm font-medium transition ${
                            newExpenseFreq === f ? "border-black bg-black/[0.02]" : "border-black/6 bg-[#fcfcfb]"
                          }`}
                        >
                          {f === "MONTHLY" ? "Monthly" : "Bi-weekly"}
                        </button>
                      ))}
                    </div>
                    <Input
                      className={inputClass}
                      placeholder="Due date (day 1-31, optional)"
                      type="number"
                      min={1}
                      max={31}
                      value={newExpenseDueDate}
                      onChange={(e) => setNewExpenseDueDate(e.target.value)}
                    />
                    <Button
                      onClick={handleAddExpense}
                      disabled={createExpense.isPending}
                      className="h-11 w-full rounded-2xl bg-black text-white hover:bg-black/90"
                    >
                      <Check className="mr-2 h-4 w-4" /> {createExpense.isPending ? "Adding..." : "Add expense"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showAddExpense && (
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex w-full items-center justify-center gap-2 rounded-[22px] border border-dashed border-black/12 p-4 text-sm font-medium text-black/42 transition hover:border-black/20 hover:text-black/60"
              >
                <Plus className="h-4 w-4" /> Add fixed expense
              </button>
            )}
          </CardContent>
        </Card>

        {/* ─── Emergency Fund Calculator ─── */}
        <Card className={card}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <SectionEyebrow>Safety net</SectionEyebrow>
                <CardTitle className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">Emergency fund</CardTitle>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ecfaf1] text-[#27945c]">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fixedExpenses.length === 0 ? (
              <p className="py-6 text-center text-sm text-black/38">
                Add fixed expenses above to calculate your emergency fund.
              </p>
            ) : (
              <>
                {/* Month selector */}
                <div className="space-y-2">
                  <p className="text-sm text-black/42">Months to cover</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEmergencyMonths(Math.max(1, emergencyMonths - 1))}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-black/6 bg-[#fcfcfb] transition hover:bg-white"
                    >
                      <Minus className="h-4 w-4 text-black/50" />
                    </button>
                    <div className="flex flex-1 gap-1.5">
                      {[3, 6, 9, 12].map((m) => (
                        <button
                          key={m}
                          onClick={() => setEmergencyMonths(m)}
                          className={`flex-1 rounded-2xl border p-2.5 text-sm font-medium transition ${
                            emergencyMonths === m
                              ? "border-[#27945c] bg-[#ecfaf1]/60 text-[#27945c]"
                              : "border-black/6 bg-[#fcfcfb] text-black/50 hover:bg-white"
                          }`}
                        >
                          {m}mo
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setEmergencyMonths(Math.min(24, emergencyMonths + 1))}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-black/6 bg-[#fcfcfb] transition hover:bg-white"
                    >
                      <Plus className="h-4 w-4 text-black/50" />
                    </button>
                  </div>
                </div>

                {/* Result */}
                <div className="rounded-[22px] border border-[#27945c]/15 bg-[#ecfaf1]/30 p-5">
                  <p className="text-sm text-[#27945c]/70">
                    You need to save
                  </p>
                  <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-[#27945c]">
                    {formatCurrency(totalFixed * emergencyMonths)}
                  </p>
                  <p className="mt-2 text-sm text-black/42">
                    to cover <span className="font-medium text-black/60">{emergencyMonths} month{emergencyMonths !== 1 ? "s" : ""}</span> of
                    fixed expenses at {formatCurrency(totalFixed)}/mo
                  </p>
                </div>

                {/* Breakdown */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-black/50">Breakdown</p>
                  {fixedExpenses.map((expense) => {
                    const monthly = expense.frequency === "BIWEEKLY"
                      ? Number(expense.amount) * 26 / 12
                      : Number(expense.amount);
                    return (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between rounded-[18px] border border-black/4 bg-[#fcfcfb] px-4 py-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <Receipt className="h-3.5 w-3.5 text-black/28" />
                          <span className="text-[14px] text-black/70">{expense.name}</span>
                        </div>
                        <span className="text-[14px] font-medium text-black/60">
                          {formatCurrency(monthly * emergencyMonths)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Right Column ─── */}
      <div className="space-y-6">
        {/* ─── Purchase Goals ─── */}
        <Card className={card}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <SectionEyebrow>Goals</SectionEyebrow>
                <CardTitle className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">Purchase goals</CardTitle>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef7ff] text-[#2e7cd6]">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {purchaseGoals.map((goal, i) => (
              <div
                key={goal.id}
                className={`rounded-[22px] border border-black/6 p-4 ${goal.isAchieved ? "bg-[#ecfaf1]/40" : "bg-[#fcfcfb]"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`${iconWrap} ${goal.isAchieved ? "bg-[#ecfaf1] text-[#27945c]" : "bg-[#eef7ff] text-[#2e7cd6]"}`}>
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`text-[15px] font-medium ${goal.isAchieved ? "text-[#27945c] line-through" : "text-black"}`}>
                        {goal.name}
                      </p>
                      <p className="mt-0.5 text-[20px] font-semibold tracking-[-0.03em] text-black">
                        {formatCurrency(goal.targetPrice)}
                      </p>
                      {!goal.isAchieved && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-black/30" />
                            <p className="text-sm text-black/50">
                              {goal.monthsToGoal
                                ? `~${goal.monthsToGoal} month${goal.monthsToGoal !== 1 ? "s" : ""}${goal.paychecksToGoal ? ` (${goal.paychecksToGoal} paycheck${goal.paychecksToGoal !== 1 ? "s" : ""})` : ""} · ${formatEstimatedDate(goal.estimatedDate)}`
                                : "Add income to compute timeline"
                              }
                            </p>
                          </div>
                          {goal.monthlySavingsRate > 0 && (
                            <p className="text-xs text-black/38">
                              Saving ~{formatCurrency(goal.monthlySavingsRate)}/mo
                            </p>
                          )}
                        </div>
                      )}
                      {goal.isAchieved && (
                        <p className="mt-1 text-sm font-medium text-[#27945c]">Achieved!</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleAchieved(goal)}
                      className={`rounded-xl p-2 transition ${goal.isAchieved ? "text-[#27945c] hover:bg-[#ecfaf1]" : "text-black/28 hover:bg-black/4 hover:text-black/60"}`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="rounded-xl p-2 text-black/28 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {purchaseGoals.length === 0 && !showAddGoal && (
              <p className="py-6 text-center text-sm text-black/38">
                No purchase goals yet. Add items like a laptop, phone, or vacation.
              </p>
            )}

            <AnimatePresence>
              {showAddGoal && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-[22px] border border-black/8 bg-white p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[15px] font-medium text-black">New purchase goal</p>
                      <button onClick={() => setShowAddGoal(false)} className="text-black/30 hover:text-black">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <Input
                      className={inputClass}
                      placeholder="e.g. MacBook Pro, iPhone, Vacation"
                      value={newGoalName}
                      onChange={(e) => setNewGoalName(e.target.value)}
                    />
                    <Input
                      className={inputClass}
                      placeholder="₱ Target price"
                      type="number"
                      value={newGoalPrice}
                      onChange={(e) => setNewGoalPrice(e.target.value)}
                    />
                    <Input
                      className={inputClass}
                      placeholder="Notes (optional)"
                      value={newGoalNotes}
                      onChange={(e) => setNewGoalNotes(e.target.value)}
                    />
                    <button
                      onClick={() => setNewGoalAddToTasks(!newGoalAddToTasks)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-black/6 bg-[#fcfcfb] p-4 text-left transition hover:bg-white"
                    >
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                        newGoalAddToTasks ? "border-black bg-black" : "border-black/20"
                      }`}>
                        {newGoalAddToTasks && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-black">Add to my tasks</p>
                        <p className="text-xs text-black/40">Creates a task with the goal&apos;s target date as deadline</p>
                      </div>
                    </button>
                    <Button
                      onClick={handleAddGoal}
                      disabled={createGoal.isPending}
                      className="h-11 w-full rounded-2xl bg-black text-white hover:bg-black/90"
                    >
                      <Check className="mr-2 h-4 w-4" /> {createGoal.isPending ? "Adding..." : "Add goal"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showAddGoal && (
              <button
                onClick={() => setShowAddGoal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-[22px] border border-dashed border-black/12 p-4 text-sm font-medium text-black/42 transition hover:border-black/20 hover:text-black/60"
              >
                <Plus className="h-4 w-4" /> Add purchase goal
              </button>
            )}
          </CardContent>
        </Card>

        {/* ─── Savings Progress ─── */}
        <Card className={card}>
          <CardHeader>
            <SectionEyebrow>Savings</SectionEyebrow>
            <CardTitle className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">Savings progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {savingsGoals.length === 0 && (
              <p className="py-8 text-center text-sm text-black/38">No savings goals yet.</p>
            )}
            {savingsGoals.map((goal) => (
              <div key={goal.id ?? goal.name} className="rounded-[22px] border border-black/6 bg-[#fcfcfb] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[15px] font-medium text-black">{goal.name}</p>
                    <p className="mt-1 text-sm text-black/42">{formatCurrency(goal.currentAmount)} saved</p>
                  </div>
                  <Badge className="rounded-full border border-black/6 bg-white px-3 py-1 text-black/58 hover:bg-white">{goal.pct}%</Badge>
                </div>
                <div className="h-2 rounded-full bg-black/6">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${goal.pct}%` }} transition={{ duration: 0.45 }} className={`h-2 rounded-full ${goal.tone}`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
