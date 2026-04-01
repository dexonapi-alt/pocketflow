"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, PiggyBank, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionEyebrow } from "./section-eyebrow";
import { useCreateTransaction } from "@/hooks/use-transactions";

export type ModalType = "expense" | "save" | null;

const iconWrap = "flex h-10 w-10 items-center justify-center rounded-2xl border border-black/6";
const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

interface ActionModalProps {
  open: boolean;
  onClose: () => void;
  type: Exclude<ModalType, null>;
}

export function ActionModal({ open, onClose, type }: ActionModalProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const createTransaction = useCreateTransaction();

  const title = type === "expense" ? "Add expense" : "Move to savings";
  const cta = type === "expense" ? "Add transaction" : "Save money";
  const tone = type === "expense" ? "bg-[#fff0f2] text-[#d4587b]" : "bg-[#eef7ff] text-[#2e7cd6]";
  const Icon = type === "expense" ? ArrowUpRight : PiggyBank;

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    await createTransaction.mutateAsync({
      type: type === "expense" ? "EXPENSE" : "SAVE",
      amount: parsedAmount,
      note: note || undefined,
      transactionDate: new Date().toISOString(),
    });

    setAmount("");
    setNote("");
    setCategory("");
    onClose();
  };

  const handleClose = () => {
    setAmount("");
    setNote("");
    setCategory("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="fixed inset-0 z-40 bg-black/12" />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[10%] z-50 mx-auto w-[92%] max-w-md"
          >
            <div className="rounded-[30px] border border-black/8 bg-white p-5 shadow-[0_28px_80px_rgba(0,0,0,0.14)]">
              <div className="mb-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${iconWrap} ${tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <SectionEyebrow>Quick action</SectionEyebrow>
                    <h3 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-black">{title}</h3>
                  </div>
                </div>
                <button onClick={handleClose} className="rounded-2xl p-2 text-black/45 transition hover:bg-black/[0.04] hover:text-black">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <Input
                  className={inputClass}
                  placeholder="₱ Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  step="0.01"
                />
                <Input
                  className={inputClass}
                  placeholder={type === "expense" ? "Note or merchant" : "Savings goal"}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Input
                  className={inputClass}
                  placeholder="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="mt-5 flex gap-3">
                <Button variant="outline" onClick={handleClose} className="h-11 flex-1 rounded-2xl border-black/10 bg-white text-black hover:bg-black/[0.03]">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createTransaction.isPending}
                  className="h-11 flex-1 rounded-2xl bg-black text-white hover:bg-black/90"
                >
                  {createTransaction.isPending ? "Saving..." : cta}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
