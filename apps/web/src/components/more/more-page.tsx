"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Target, Sparkles, ChevronRight, Check, X, Pencil,
  Plus, Trash2, Receipt,
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
import { apiPatch } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

const card = "rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)]";
const iconWrap = "flex h-10 w-10 items-center justify-center rounded-2xl border border-black/6";
const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

const goalTones = ["bg-[#2e7cd6]", "bg-[#df7b2d]", "bg-[#7357d8]", "bg-[#27945c]", "bg-[#d4587b]"];

export function MorePage() {
  const goalsQuery = useSavingsGoals();
  const onboardingQuery = useOnboarding();
  const fixedExpensesQuery = useFixedExpenses();

  // Salary editor state
  const [editingSalary, setEditingSalary] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editFreq, setEditFreq] = useState<"MONTHLY" | "BIWEEKLY">("MONTHLY");
  const [saving, setSaving] = useState(false);

  // Fixed expense form state
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editExpenseName, setEditExpenseName] = useState("");
  const [editExpenseAmount, setEditExpenseAmount] = useState("");

  const createExpense = useCreateFixedExpense();
  const updateExpense = useUpdateFixedExpense();
  const deleteExpense = useDeleteFixedExpense();

  const onboarding = onboardingQuery.data?.data;
  const fixedExpenses = fixedExpensesQuery.data?.data ?? [];
  const totalFixed = fixedExpenses.reduce((acc, e) => acc + Number(e.amount), 0);

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
    createExpense.mutate(
      { name: newExpenseName.trim(), amount },
      {
        onSuccess: () => {
          setNewExpenseName("");
          setNewExpenseAmount("");
          setShowAddExpense(false);
        },
      },
    );
  };

  const startEditExpense = (expense: { id: string; name: string; amount: number }) => {
    setEditingExpenseId(expense.id);
    setEditExpenseName(expense.name);
    setEditExpenseAmount(String(expense.amount));
  };

  const handleUpdateExpense = () => {
    if (!editingExpenseId) return;
    const amount = parseFloat(editExpenseAmount);
    if (!editExpenseName.trim() || !amount || amount <= 0) return;
    updateExpense.mutate(
      { id: editingExpenseId, name: editExpenseName.trim(), amount },
      { onSuccess: () => setEditingExpenseId(null) },
    );
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense.mutate(id);
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
    { key: "goals", title: "Savings goals", note: `${goalsQuery.data?.data?.length ?? 0} active goals`, icon: Target, tone: "bg-[#eef7ff] text-[#2e7cd6]", editable: false },
    { key: "ai", title: "AI coach", note: "Weekly tips enabled", icon: Sparkles, tone: "bg-[#fff4e8] text-[#df7b2d]", editable: false },
  ];

  const apiGoals = goalsQuery.data?.data;
  const goals = apiGoals && apiGoals.length > 0
    ? apiGoals.map((g, i) => ({
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
      {/* ─── Profile & Settings ─── */}
      <div className="space-y-6">
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

            {/* ─── Salary Editor Modal ─── */}
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
                <SectionEyebrow>Monthly bills</SectionEyebrow>
                <CardTitle className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">Fixed expenses</CardTitle>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1f0] text-[#d4587b]">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Total */}
            {fixedExpenses.length > 0 && (
              <div className="rounded-[22px] border border-black/6 bg-[#fcfcfb] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-black/42">Total monthly fixed</p>
                  <p className="text-[20px] font-semibold tracking-[-0.03em]">{formatCurrency(totalFixed)}</p>
                </div>
              </div>
            )}

            {/* Expense list */}
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
                        <p className="mt-0.5 text-sm text-black/42">{formatCurrency(Number(expense.amount))}/mo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditExpense({ id: expense.id, name: expense.name, amount: Number(expense.amount) })}
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
                No fixed expenses yet. Add your monthly bills like rent, internet, utilities.
              </p>
            )}

            {/* Add new expense form */}
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
                      placeholder="₱ Monthly amount"
                      type="number"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(e.target.value)}
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
      </div>

      {/* ─── Savings Progress ─── */}
      <Card className={card}>
        <CardHeader>
          <SectionEyebrow>Goals</SectionEyebrow>
          <CardTitle className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">Savings progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.length === 0 && (
            <p className="py-8 text-center text-sm text-black/38">No savings goals yet.</p>
          )}
          {goals.map((goal) => (
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
  );
}
