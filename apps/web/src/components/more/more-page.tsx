"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Target, Sparkles, ChevronRight, Check, X, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionEyebrow } from "@/components/shared";
import { useSavingsGoals } from "@/hooks/use-savings-goals";
import { useOnboarding } from "@/hooks/use-onboarding";
import { apiPatch } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

const card = "rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)]";
const iconWrap = "flex h-10 w-10 items-center justify-center rounded-2xl border border-black/6";
const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

const goalTones = ["bg-[#2e7cd6]", "bg-[#df7b2d]", "bg-[#7357d8]", "bg-[#27945c]", "bg-[#d4587b]"];

export function MorePage() {
  const goalsQuery = useSavingsGoals();
  const onboardingQuery = useOnboarding();

  const [editingSalary, setEditingSalary] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editFreq, setEditFreq] = useState<"MONTHLY" | "BIWEEKLY">("MONTHLY");
  const [saving, setSaving] = useState(false);

  const onboarding = onboardingQuery.data?.data;

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

          {/* Next payday info */}
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
