"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionEyebrow } from "@/components/shared";
import { useSavingsForecast } from "@/hooks/use-ai";
import { formatCurrency } from "@/lib/utils";

const card = "rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)]";

type ViewMode = "optimistic" | "realistic" | "conservative";

const viewLabels: Record<ViewMode, { label: string; color: string }> = {
  optimistic: { label: "Optimistic", color: "bg-[#ecfaf1] text-[#27945c]" },
  realistic: { label: "Realistic", color: "bg-[#eef7ff] text-[#2e7cd6]" },
  conservative: { label: "Conservative", color: "bg-[#fff4e8] text-[#df7b2d]" },
};

const barColors: Record<ViewMode, string> = {
  optimistic: "bg-[#27945c]",
  realistic: "bg-[#2e7cd6]",
  conservative: "bg-[#df7b2d]",
};

export function SavingsForecast() {
  const [viewMode, setViewMode] = useState<ViewMode>("realistic");
  const forecastQuery = useSavingsForecast();

  const forecast = forecastQuery.data?.data;
  const isLoading = forecastQuery.isLoading;

  if (isLoading) {
    return (
      <Card className={card}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12 gap-3 text-black/40">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">AI is analyzing your savings potential...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!forecast) {
    return (
      <Card className={card}>
        <CardContent className="p-6">
          <div className="py-8 text-center text-sm text-black/38">
            Add income and expense transactions to unlock savings forecasts.
          </div>
        </CardContent>
      </Card>
    );
  }

  const projections = forecast.projections ?? [];
  const maxAmount = Math.max(...projections.map((p) => p.optimistic), 1);

  return (
    <Card className={card}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <SectionEyebrow>AI forecast</SectionEyebrow>
            <CardTitle className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-black">
              Savings projections
            </CardTitle>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f6f3ff] text-[#7357d8]">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* ─── View Mode Switcher ─── */}
        <div className="inline-flex rounded-full border border-black/8 bg-[#f5f5f2] p-1">
          {(Object.keys(viewLabels) as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                viewMode === mode ? "bg-white text-black shadow-sm" : "text-black/42"
              }`}
            >
              {viewLabels[mode].label}
            </button>
          ))}
        </div>

        {/* ─── Monthly Rate ─── */}
        <div className="rounded-[22px] border border-black/6 bg-[#fcfcfb] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/42">Est. monthly savings</p>
              <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em]">
                {formatCurrency(forecast.monthlyRate)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ecfaf1] text-[#27945c]">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* ─── Projection Bars ─── */}
        <div className="space-y-3">
          {projections.map((p, i) => {
            const value = p[viewMode];
            const pct = Math.max(8, Math.round((value / maxAmount) * 100));

            return (
              <div key={p.period} className="rounded-[22px] border border-black/6 bg-[#fcfcfb] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[15px] font-medium text-black">{p.period}</p>
                  <p className="text-[15px] font-semibold text-black">{formatCurrency(value)}</p>
                </div>
                <div className="h-2.5 rounded-full bg-black/6">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className={`h-2.5 rounded-full ${barColors[viewMode]}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── AI Insight ─── */}
        {forecast.insight && (
          <div className="rounded-[22px] border border-black/6 bg-[#f6f3ff]/30 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f6f3ff] text-[#7357d8]">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm leading-6 text-black/58">{forecast.insight}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
