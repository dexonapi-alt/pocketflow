"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionEyebrow } from "@/components/shared";
import { formatCurrency } from "@/lib/utils";

const card = "rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)]";

interface DayData {
  day: string;
  amount: number;
}

interface WeeklyChartProps {
  daily: DayData[];
  totalSpent: number;
}

export function WeeklyChart({ daily, totalSpent }: WeeklyChartProps) {
  const maxAmount = Math.max(...daily.map((d) => d.amount), 1);
  const avgPerDay = daily.length > 0 ? Math.round(totalSpent / daily.length) : 0;
  const hasData = daily.some((d) => d.amount > 0);

  return (
    <Card className={card}>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div>
            <SectionEyebrow>Spending overview</SectionEyebrow>
            <CardTitle className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-black">Weekly spend</CardTitle>
          </div>
          <Badge className="rounded-full border-0 bg-[#f3f3f1] px-3 py-1 text-black hover:bg-[#f3f3f1]">Last 7 days</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="rounded-[24px] border border-black/6 bg-[#fcfcfb] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-black/42">Total spent</p>
              <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em]">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="text-right text-sm text-black/44">
              <p>Avg / day</p>
              <p className="mt-1 font-medium text-black">{formatCurrency(avgPerDay)}</p>
            </div>
          </div>

          <div className="relative h-[260px] overflow-hidden rounded-[22px] border border-black/6 bg-white p-4">
            {/* Grid lines */}
            <div className="absolute inset-x-4 top-0 h-full">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="absolute left-0 right-0 border-t border-dashed border-black/6" style={{ top: `${i * 25}%` }} />
              ))}
            </div>

            {/* Empty state */}
            {!hasData && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <p className="text-sm text-black/25">Add expense transactions to see your chart</p>
              </div>
            )}

            {/* Bars */}
            <div className="relative flex h-full items-end gap-3 pt-8">
              {daily.map((bar, i) => {
                const pct = hasData && bar.amount > 0
                  ? Math.max(8, Math.round((bar.amount / maxAmount) * 100))
                  : 0;
                return (
                  <div key={`${bar.day}-${i}`} className="flex flex-1 flex-col items-center justify-end gap-3">
                    {pct > 0 ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0.8 }}
                        animate={{ height: `${pct}%`, opacity: 1 }}
                        transition={{ duration: 0.35, delay: i * 0.04 }}
                        className="relative w-full rounded-[18px] bg-[#111111]"
                      >
                        <div className="absolute inset-x-0 top-0 h-10 rounded-t-[18px] bg-gradient-to-b from-white/16 to-transparent" />
                      </motion.div>
                    ) : hasData ? (
                      <div className="w-full h-1 rounded-full bg-black/6" />
                    ) : null}
                    <div className="text-center">
                      <p className="text-xs font-medium text-black/72">{bar.day}</p>
                      {bar.amount > 0 && (
                        <p className="mt-1 text-[11px] text-black/35">₱{bar.amount.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
