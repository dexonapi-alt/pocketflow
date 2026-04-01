"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    q: "What is PocketFlow?",
    a: "PocketFlow is a salary-based financial planner that helps you track daily spending, set savings goals, and get AI-powered insights about your money habits.",
  },
  {
    q: "Is it really free to start?",
    a: "Yes. The free plan gives you 10 transactions per month, 2 tasks, and access to the dashboard. No credit card required.",
  },
  {
    q: "How does the AI chatbot work?",
    a: "The AI chatbot has full context of your financial data — income, expenses, savings, and salary info. It remembers previous conversations and gives personalized advice.",
  },
  {
    q: "What does the savings forecast show?",
    a: "It uses AI to project how much you could save in 1, 3, 6, and 12 months based on your current spending patterns. You can toggle between optimistic, realistic, and conservative views.",
  },
  {
    q: "Can I cancel or downgrade my plan?",
    a: "Yes. You can switch plans at any time from the Plans page. Downgrades take effect immediately.",
  },
  {
    q: "Is my financial data secure?",
    a: "Yes. All data is encrypted, passwords are hashed with bcrypt, and we use JWT tokens for authentication. Your data is never shared with third parties.",
  },
  {
    q: "What currencies are supported?",
    a: "PocketFlow defaults to PHP (Philippine Peso) but you can change your currency in settings.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <Badge className="rounded-full border-0 bg-[#ecfaf1] px-3 py-1 text-[#27945c]">FAQ</Badge>
          <h2 className="mt-4 text-[36px] font-semibold tracking-[-0.04em] text-black sm:text-[44px]">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-[16px] text-black/46">
            Have other questions? Reach out to us anytime.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-[20px] border border-black/6 bg-white"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-[15px] font-medium text-black">{faq.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-black/30 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-[15px] leading-7 text-black/50">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
