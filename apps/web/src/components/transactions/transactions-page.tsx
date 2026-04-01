"use client";

import { useState, useMemo } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  Search,
  Coffee,
  Car,
  HeartPulse,
  ShoppingBag,
  TrendingUp,
  Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionEyebrow, ActionModal, type ModalType } from "@/components/shared";
import { useTransactions, useCreateTransaction } from "@/hooks/use-transactions";
import { formatCurrency, formatTime } from "@/lib/utils";

const card = "rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)]";
const iconWrap = "flex h-10 w-10 items-center justify-center rounded-2xl border border-black/6";
const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

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


export function TransactionsPage() {
  const [query, setQuery] = useState("");
  const [modalType, setModalType] = useState<ModalType>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const [selectedType, setSelectedType] = useState<"EXPENSE" | "INCOME" | "SAVE">("EXPENSE");

  const txQuery = useTransactions({ search: query || undefined });
  const createTransaction = useCreateTransaction();

  const transactions = txQuery.data?.data?.data ?? [];

  const filtered = useMemo(() => {
    if (!query) return transactions;
    return transactions.filter((t) =>
      `${t.merchantName ?? ""} ${t.note ?? ""} ${t.category?.name ?? ""}`.toLowerCase().includes(query.toLowerCase()),
    );
  }, [transactions, query]);

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    await createTransaction.mutateAsync({
      type: selectedType,
      amount: parsedAmount,
      note: note || undefined,
      transactionDate: new Date().toISOString(),
    });

    setAmount("");
    setNote("");
    setCategory("");
  };

  const typeButtons = [
    { label: "Expense", type: "EXPENSE" as const, icon: ArrowUpRight, tone: "bg-[#fff0f2] text-[#d4587b]", modal: "expense" as const },
    { label: "Income", type: "INCOME" as const, icon: ArrowDownLeft, tone: "bg-[#ecfaf1] text-[#27945c]", modal: "expense" as const },
    { label: "Save", type: "SAVE" as const, icon: PiggyBank, tone: "bg-[#eef7ff] text-[#2e7cd6]", modal: "save" as const },
  ];

  return (
    <>
      <ActionModal open={modalType !== null} onClose={() => setModalType(null)} type={(modalType ?? "expense") as Exclude<ModalType, null>} />
      <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        {/* ─── Add Transaction Card ─── */}
        <Card className={card}>
          <CardHeader>
            <SectionEyebrow>New record</SectionEyebrow>
            <CardTitle className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">Add transaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {typeButtons.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setSelectedType(item.type);
                      setModalType(item.modal);
                    }}
                    className="rounded-[22px] border border-black/6 bg-[#fcfcfb] p-4 text-left transition hover:bg-white"
                  >
                    <div className={`${iconWrap} ${item.tone}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="mt-3 text-[14px] font-medium text-black">{item.label}</p>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              <Input className={inputClass} placeholder="₱ Amount" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="0.01" />
              <Input className={inputClass} placeholder="Note or merchant" value={note} onChange={(e) => setNote(e.target.value)} />
              <Input className={inputClass} placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createTransaction.isPending}
              className="h-12 w-full rounded-2xl bg-black text-white hover:bg-black/90"
            >
              {createTransaction.isPending ? "Adding..." : "Add transaction"}
            </Button>
          </CardContent>
        </Card>

        {/* ─── Transaction History Card ─── */}
        <Card className={card}>
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <SectionEyebrow>Ledger</SectionEyebrow>
                <CardTitle className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">Transaction history</CardTitle>
              </div>
              <div className="relative w-72 max-w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} className={`${inputClass} pl-9`} placeholder="Search transactions" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Today", "This week", "This cycle"].map((tag) => (
                <Badge key={tag} className="rounded-full border border-black/6 bg-[#f3f3f1] px-3 py-1 text-black/55 hover:bg-[#f3f3f1]">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filtered.map((t) => {
              const catName = t.category?.name ?? (t.type === "INCOME" ? "Income" : t.type === "SAVE" ? "Save" : "Expense");
              const Icon = categoryIconMap[catName] || Receipt;
              const tone = categoryStyleMap[catName] || "bg-[#f3f3f1] text-black/60";
              const isPositive = t.type === "INCOME";
              const displayName = t.merchantName || t.note || catName;

              return (
                <div key={t.id} className="flex items-center justify-between rounded-[22px] border border-black/6 bg-[#fcfcfb] p-4 transition hover:bg-white">
                  <div className="flex items-center gap-3">
                    <div className={`${iconWrap} ${tone}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-black">{displayName}</p>
                      <p className="mt-1 text-sm text-black/42">{t.note ?? ""} · {formatTime(t.transactionDate)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[15px] font-semibold ${isPositive ? "text-[#27945c]" : "text-black"}`}>
                      {isPositive ? "+" : "-"}{formatCurrency(Math.abs(t.amount))}
                    </p>
                    <p className="mt-1 text-xs text-black/35">{catName}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
