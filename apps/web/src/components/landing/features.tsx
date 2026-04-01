"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  PiggyBank,
  BarChart3,
  CalendarDays,
  ListTodo,
  MessageCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScreenshotSlot } from "./screenshot-slot";

const features = [
  {
    tag: "Dashboard",
    title: "Your money at a glance",
    description: "See your balance, spending, savings, and cycle health — all in one clean dashboard. No clutter, no confusion.",
    screenshot: "feature-dashboard.png",
    icon: Wallet,
    tone: "bg-[#ecfaf1] text-[#27945c]",
  },
  {
    tag: "Transactions",
    title: "Log every peso",
    description: "Add expenses, income, and savings transfers in seconds. Search, filter, and track where your money actually goes.",
    screenshot: "feature-transactions.png",
    icon: BarChart3,
    tone: "bg-[#eef7ff] text-[#2e7cd6]",
  },
  {
    tag: "AI Forecast",
    title: "See your future savings",
    description: "AI-powered projections show you what you could save in 1, 3, 6, or 12 months — with optimistic, realistic, and conservative views.",
    screenshot: "feature-forecast.png",
    icon: TrendingUp,
    tone: "bg-[#f4efff] text-[#7357d8]",
  },
  {
    tag: "Calendar",
    title: "Pin events to dates",
    description: "Plan ahead with a visual calendar. Pin financial events, bill reminders, and payday markers to any date.",
    screenshot: "feature-calendar.png",
    icon: CalendarDays,
    tone: "bg-[#fff4e8] text-[#df7b2d]",
  },
  {
    tag: "Tasks",
    title: "Track financial goals",
    description: "Create tasks for money goals. Set priorities, track progress, and check things off as you go.",
    screenshot: "feature-tasks.png",
    icon: ListTodo,
    tone: "bg-[#fff0f2] text-[#d4587b]",
  },
  {
    tag: "AI Chatbot",
    title: "Your personal finance coach",
    description: "Ask anything about your money. The AI knows your data and remembers your conversations — like having a financial advisor in your pocket.",
    screenshot: "feature-chatbot.png",
    icon: MessageCircle,
    tone: "bg-[#f6f3ff] text-[#7357d8]",
  },
];

export function Features() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <Badge className="rounded-full border-0 bg-[#f4efff] px-3 py-1 text-[#7357d8]">Features</Badge>
          <h2 className="mt-4 text-[36px] font-semibold tracking-[-0.04em] text-black sm:text-[44px]">
            Everything you need to manage money
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[16px] text-black/46">
            Built for people who earn a salary and want to see exactly where every peso goes.
          </p>
        </div>

        <div className="mt-16 space-y-24">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const isReversed = i % 2 === 1;

            return (
              <motion.div
                key={feature.tag}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className={`grid items-center gap-10 lg:grid-cols-2 ${isReversed ? "lg:direction-rtl" : ""}`}
              >
                {/* Text */}
                <div className={`${isReversed ? "lg:order-2 lg:text-left" : ""}`} style={{ direction: "ltr" }}>
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${feature.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge className="ml-3 rounded-full border border-black/6 bg-[#f3f3f1] px-3 py-1 text-black/55">
                    {feature.tag}
                  </Badge>
                  <h3 className="mt-4 text-[28px] font-semibold tracking-[-0.03em] text-black">
                    {feature.title}
                  </h3>
                  <p className="mt-3 max-w-md text-[15px] leading-7 text-black/50">
                    {feature.description}
                  </p>
                </div>

                {/* Screenshot */}
                <div className={`${isReversed ? "lg:order-1" : ""}`} style={{ direction: "ltr" }}>
                  <div className="overflow-hidden rounded-[20px] border border-black/8 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
                    <ScreenshotSlot name={feature.screenshot} alt={feature.title} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
