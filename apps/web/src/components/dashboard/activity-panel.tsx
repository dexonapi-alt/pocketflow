"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Coffee,
  Car,
  HeartPulse,
  ShoppingBag,
  TrendingUp,
  PiggyBank,
  Receipt,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { formatCurrency, formatTime } from "@/lib/utils";

const card = "rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)]";
const iconWrap = "flex h-10 w-10 items-center justify-center rounded-2xl border border-black/6";

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Food: Coffee,
  Income: TrendingUp,
  Save: PiggyBank,
  Transport: Car,
  Health: HeartPulse,
  Shopping: ShoppingBag,
};

const categoryStyleMap: Record<string, string> = {
  Food: "bg-[#fff4e8] text-[#df7b2d]",
  Income: "bg-[#ecfaf1] text-[#27945c]",
  Save: "bg-[#eef7ff] text-[#2e7cd6]",
  Transport: "bg-[#f4efff] text-[#7357d8]",
  Health: "bg-[#fff0f2] text-[#d4587b]",
  Shopping: "bg-[#fff3ec] text-[#d96f42]",
};

interface Transaction {
  id: string;
  type: string;
  amount: number;
  note: string | null;
  merchantName: string | null;
  transactionDate: string;
  category: { id: string; name: string; icon: string | null } | null;
}

interface TopCategory {
  categoryId: string;
  name: string;
  amount: number;
  share: number;
  icon: string | null;
  color: string | null;
}

interface ActivityPanelProps {
  transactions: Transaction[];
  topCategories: TopCategory[];
}

export function ActivityPanel({ transactions, topCategories }: ActivityPanelProps) {
  const [tab, setTab] = useState<"recent" | "categories">("recent");

  return (
    <Card className={card}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex rounded-full border border-black/8 bg-[#f5f5f2] p-1">
            <button
              onClick={() => setTab("recent")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === "recent" ? "bg-white text-black shadow-sm" : "text-black/42"
              }`}
            >
              Recent activity
            </button>
            <button
              onClick={() => setTab("categories")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === "categories" ? "bg-white text-black shadow-sm" : "text-black/42"
              }`}
            >
              Top categories
            </button>
          </div>
          <button className="rounded-2xl border border-black/8 bg-white px-3 py-2 text-sm text-black/55 hover:bg-black/[0.02]">View all</button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }} className="space-y-3">
            {tab === "recent" && transactions.length === 0 && (
              <p className="py-8 text-center text-sm text-black/38">No transactions yet. Add your first one!</p>
            )}
            {tab === "categories" && topCategories.length === 0 && (
              <p className="py-8 text-center text-sm text-black/38">Spend some money to see categories here.</p>
            )}
            {tab === "recent"
              ? transactions.map((t) => {
                  const catName = t.category?.name ?? (t.type === "INCOME" ? "Income" : t.type === "SAVE" ? "Save" : "Expense");
                  const Icon = categoryIconMap[catName] || Receipt;
                  const tone = categoryStyleMap[catName] || "bg-[#f3f3f1] text-black/60";
                  const isPositive = t.type === "INCOME";
                  const displayName = t.merchantName || t.note || catName;

                  return (
                    <button key={t.id} className="flex w-full items-center justify-between rounded-[22px] border border-black/6 bg-[#fcfcfb] p-4 text-left transition hover:bg-white">
                      <div className="flex items-center gap-3">
                        <div className={`${iconWrap} ${tone}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[15px] font-medium text-black">{displayName}</p>
                          <p className="mt-1 text-sm text-black/42">
                            {t.note ?? ""} · {formatTime(t.transactionDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-[15px] font-semibold ${isPositive ? "text-[#27945c]" : "text-black"}`}>
                          {isPositive ? "+" : "-"}{formatCurrency(Math.abs(t.amount))}
                        </p>
                        <p className="mt-1 text-xs text-black/35">{catName}</p>
                      </div>
                    </button>
                  );
                })
              : topCategories.map((item) => {
                  const Icon = categoryIconMap[item.name] || Receipt;
                  const tone = categoryStyleMap[item.name] || "bg-[#f3f3f1] text-black/60";

                  return (
                    <button key={item.categoryId} className="flex w-full items-center justify-between rounded-[22px] border border-black/6 bg-[#fcfcfb] p-4 text-left transition hover:bg-white">
                      <div className="flex items-center gap-3">
                        <div className={`${iconWrap} ${tone}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[15px] font-medium text-black">{item.name}</p>
                          <p className="mt-1 text-sm text-black/42">{item.share}% of total</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[15px] font-semibold text-black">{formatCurrency(item.amount)}</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-black/42">Open <ArrowRight className="h-3 w-3" /></p>
                      </div>
                    </button>
                  );
                })}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
