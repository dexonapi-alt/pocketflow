"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  CalendarDays,
  PiggyBank,
  ArrowRight,
  ArrowLeft,
  Check,
  Banknote,
  SkipForward,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionEyebrow } from "@/components/shared";
import { apiPost } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

const card = "rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)]";
const iconWrap = "flex h-10 w-10 items-center justify-center rounded-2xl border border-black/6";
const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

interface OnboardingWizardProps {
  onComplete: () => void;
}

type Step = "salary" | "frequency" | "lastPayday" | "balance" | "done";

const steps: Step[] = ["salary", "frequency", "lastPayday", "balance", "done"];

function computeNextPayday(lastPaydayStr: string, freq: "MONTHLY" | "BIWEEKLY"): { nextDate: Date; daysUntil: number } {
  const last = new Date(lastPaydayStr);
  const now = new Date();
  let next: Date;

  if (freq === "MONTHLY") {
    // Same day next month(s)
    next = new Date(last);
    while (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  } else {
    // Every 14 days
    next = new Date(last);
    while (next <= now) {
      next.setDate(next.getDate() + 14);
    }
  }

  const diff = Math.ceil((next.getTime() - now.getTime()) / 86_400_000);
  return { nextDate: next, daysUntil: Math.max(0, diff) };
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState<Step>("salary");
  const [salary, setSalary] = useState("");
  const [frequency, setFrequency] = useState<"MONTHLY" | "BIWEEKLY">("MONTHLY");
  const [lastPayday, setLastPayday] = useState("");
  const [balance, setBalance] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const currentIndex = steps.indexOf(step);
  const progress = (currentIndex / (steps.length - 1)) * 100;

  const nextPayInfo = useMemo(() => {
    if (!lastPayday) return null;
    try {
      return computeNextPayday(lastPayday, frequency);
    } catch {
      return null;
    }
  }, [lastPayday, frequency]);

  const goNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) setStep(steps[nextIndex]);
  };

  const goBack = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) setStep(steps[prevIndex]);
  };

  const handleSkip = async () => {
    // Save minimal profile for no-salary users
    setSaving(true);
    try {
      await apiPost("/onboarding", {
        salaryAmount: 0,
        salaryFrequency: "MONTHLY",
        startingBalance: balance ? parseFloat(balance) : null,
      });
      setStep("done");
    } catch (err: any) {
      setError(err.message ?? "Failed to save");
      setSaving(false);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    setError("");

    try {
      const paydayDay = nextPayInfo ? nextPayInfo.nextDate.getDate() : null;

      await apiPost("/onboarding", {
        salaryAmount: salary ? parseFloat(salary) : 0,
        salaryFrequency: frequency,
        paydayDayOfMonth: paydayDay,
        nextPayday: nextPayInfo ? nextPayInfo.nextDate.toISOString() : null,
        startingBalance: balance ? parseFloat(balance) : null,
      });
      setStep("done");
    } catch (err: any) {
      setError(err.message ?? "Failed to save");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* ─── Progress Bar ─── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <SectionEyebrow>Financial setup</SectionEyebrow>
          <span className="text-xs text-black/38">{currentIndex + 1} of {steps.length}</span>
        </div>
        <div className="h-1.5 rounded-full bg-black/6">
          <motion.div
            className="h-1.5 rounded-full bg-black"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl bg-[#fff0f2] px-4 py-3 text-sm text-[#d4587b]">{error}</div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* ─── Step 1: Salary ─── */}
          {step === "salary" && (
            <Card className={card}>
              <CardContent className="p-7 sm:p-9">
                <div className={`${iconWrap} bg-[#ecfaf1] text-[#27945c] mb-5`}>
                  <Banknote className="h-5 w-5" />
                </div>
                <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-black">Do you have a regular salary?</h3>
                <p className="mt-2 text-[15px] text-black/54">
                  Enter your salary amount. This will be automatically added to your income on payday. You can change this anytime.
                </p>
                <div className="mt-6">
                  <Input
                    className={inputClass}
                    placeholder="₱ Salary amount"
                    type="number"
                    step="0.01"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={handleSkip}
                    disabled={saving}
                    className="inline-flex items-center gap-2 text-sm text-black/40 hover:text-black transition"
                  >
                    <SkipForward className="h-3.5 w-3.5" />
                    {saving ? "Saving..." : "Skip — I don't have a salary"}
                  </button>
                  <Button onClick={goNext} disabled={!salary} className="h-11 rounded-2xl bg-black px-6 text-white hover:bg-black/90">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── Step 2: Frequency ─── */}
          {step === "frequency" && (
            <Card className={card}>
              <CardContent className="p-7 sm:p-9">
                <div className={`${iconWrap} bg-[#f4efff] text-[#7357d8] mb-5`}>
                  <CalendarDays className="h-5 w-5" />
                </div>
                <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-black">How often are you paid?</h3>
                <p className="mt-2 text-[15px] text-black/54">We'll auto-track your pay cycles and calculate the next payday.</p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {[
                    { value: "MONTHLY" as const, label: "Monthly", desc: "Once a month" },
                    { value: "BIWEEKLY" as const, label: "Biweekly", desc: "Every 2 weeks" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFrequency(opt.value)}
                      className={`rounded-[22px] border p-5 text-left transition ${
                        frequency === opt.value
                          ? "border-black bg-black/[0.02] shadow-[0_8px_20px_rgba(0,0,0,0.04)]"
                          : "border-black/6 bg-[#fcfcfb] hover:bg-white"
                      }`}
                    >
                      <p className="text-[15px] font-medium text-black">{opt.label}</p>
                      <p className="mt-1 text-sm text-black/42">{opt.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={goBack} className="h-11 rounded-2xl border-black/10 px-5">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button onClick={goNext} className="h-11 rounded-2xl bg-black px-6 text-white hover:bg-black/90">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── Step 3: Last Payday ─── */}
          {step === "lastPayday" && (
            <Card className={card}>
              <CardContent className="p-7 sm:p-9">
                <div className={`${iconWrap} bg-[#eef7ff] text-[#2e7cd6] mb-5`}>
                  <Wallet className="h-5 w-5" />
                </div>
                <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-black">When was your last payday?</h3>
                <p className="mt-2 text-[15px] text-black/54">
                  We'll calculate your next payday from this date automatically.
                </p>
                <div className="mt-6">
                  <Input
                    className={inputClass}
                    type="date"
                    value={lastPayday}
                    onChange={(e) => setLastPayday(e.target.value)}
                  />
                </div>

                {/* Auto-calculated next payday preview */}
                {nextPayInfo && (
                  <div className="mt-4 rounded-[18px] bg-[#ecfaf1] p-4">
                    <p className="text-sm font-medium text-[#27945c]">
                      Next payday: {nextPayInfo.nextDate.toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                    <p className="mt-1 text-sm text-[#27945c]/70">
                      {nextPayInfo.daysUntil === 0 ? "That's today!" : `${nextPayInfo.daysUntil} day${nextPayInfo.daysUntil === 1 ? "" : "s"} from now`}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={goBack} className="h-11 rounded-2xl border-black/10 px-5">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button onClick={goNext} className="h-11 rounded-2xl bg-black px-6 text-white hover:bg-black/90">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── Step 4: Starting Balance ─── */}
          {step === "balance" && (
            <Card className={card}>
              <CardContent className="p-7 sm:p-9">
                <div className={`${iconWrap} bg-[#fff4e8] text-[#df7b2d] mb-5`}>
                  <PiggyBank className="h-5 w-5" />
                </div>
                <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-black">Current balance?</h3>
                <p className="mt-2 text-[15px] text-black/54">How much money do you have right now? This is optional — you can skip it.</p>
                <div className="mt-6">
                  <Input
                    className={inputClass}
                    placeholder="₱ Current balance (optional)"
                    type="number"
                    step="0.01"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                  />
                </div>
                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={goBack} className="h-11 rounded-2xl border-black/10 px-5">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button onClick={handleFinish} disabled={saving} className="h-11 rounded-2xl bg-black px-6 text-white hover:bg-black/90">
                    {saving ? "Saving..." : "Finish setup"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── Done ─── */}
          {step === "done" && (
            <Card className={card}>
              <CardContent className="p-7 sm:p-9 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ecfaf1] text-[#27945c]">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-[28px] font-semibold tracking-[-0.04em] text-black">You're all set!</h3>
                {salary ? (
                  <p className="mt-2 text-[15px] text-black/54">
                    Your {frequency === "MONTHLY" ? "monthly" : "biweekly"} salary of {formatCurrency(parseFloat(salary))} is saved.
                    {nextPayInfo && (
                      <> Next payday is{" "}
                        {nextPayInfo.nextDate.toLocaleDateString("en-PH", { month: "long", day: "numeric" })}
                        {" "}({nextPayInfo.daysUntil} days).
                      </>
                    )}
                  </p>
                ) : (
                  <p className="mt-2 text-[15px] text-black/54">
                    No salary set. You can add one later in settings.
                  </p>
                )}
                <div className="mt-4 inline-flex flex-wrap justify-center gap-3">
                  {[
                    salary ? `Salary: ${formatCurrency(parseFloat(salary))}` : "No salary",
                    salary ? `${frequency === "MONTHLY" ? "Monthly" : "Biweekly"}` : null,
                    nextPayInfo ? `Next: ${nextPayInfo.nextDate.toLocaleDateString("en-PH", { month: "short", day: "numeric" })}` : null,
                    balance ? `Balance: ${formatCurrency(parseFloat(balance))}` : null,
                  ]
                    .filter(Boolean)
                    .map((tag) => (
                      <span key={tag} className="rounded-full bg-[#f3f3f1] px-3 py-1 text-sm text-black/58">{tag}</span>
                    ))}
                </div>
                <Button onClick={onComplete} className="mt-8 h-12 rounded-2xl bg-black px-8 text-white hover:bg-black/90">
                  Go to dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
