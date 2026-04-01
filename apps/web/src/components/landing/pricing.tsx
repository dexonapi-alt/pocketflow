"use client";

import { motion } from "framer-motion";
import { Check, Shield, Zap, Sparkles, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    description: "Basic tracking to get started",
    icon: Shield,
    color: "bg-[#f3f3f1] text-black/60",
    features: ["10 transactions / month", "2 tasks", "Dashboard", "Weekly AI pulse"],
  },
  {
    id: "LITE",
    name: "Lite",
    price: 99,
    description: "Extended limits for regular use",
    icon: Zap,
    color: "bg-[#eef7ff] text-[#2e7cd6]",
    features: ["50 transactions / month", "10 tasks", "Limited AI chat (5/day)", "Dashboard", "Weekly AI pulse"],
  },
  {
    id: "PLUS",
    name: "Plus",
    price: 249,
    popular: true,
    description: "Full access for serious planners",
    icon: Sparkles,
    color: "bg-[#f4efff] text-[#7357d8]",
    features: ["Unlimited transactions", "Unlimited tasks", "AI chatbot (50/day)", "Savings forecast", "Calendar & planner", "Full insights"],
  },
  {
    id: "PRO_PLUS",
    name: "Pro+",
    price: 499,
    description: "Everything, no limits",
    icon: Crown,
    color: "bg-[#fff4e8] text-[#df7b2d]",
    features: ["Everything in Plus", "Unlimited AI chatbot", "Priority support", "Early access features"],
  },
];

interface PricingProps {
  onGetStarted: () => void;
}

export function Pricing({ onGetStarted }: PricingProps) {
  return (
    <section className="py-20 bg-[#fafaf7]" id="pricing">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <Badge className="rounded-full border-0 bg-[#fff4e8] px-3 py-1 text-[#df7b2d]">Pricing</Badge>
          <h2 className="mt-4 text-[36px] font-semibold tracking-[-0.04em] text-black sm:text-[44px]">
            Simple pricing for everyone
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[16px] text-black/46">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className={`relative rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)] ${plan.popular ? "ring-2 ring-[#7357d8]" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="rounded-full border-0 bg-[#7357d8] px-3 py-1 text-white">Most popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 pt-7">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${plan.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{plan.name}</h3>
                    <p className="mt-1 text-sm text-black/42">{plan.description}</p>
                    <p className="mt-4">
                      <span className="text-[32px] font-semibold tracking-[-0.03em]">
                        {plan.price === 0 ? "Free" : `₱${plan.price}`}
                      </span>
                      {plan.price > 0 && <span className="text-sm text-black/38"> /mo</span>}
                    </p>
                    <Button
                      onClick={onGetStarted}
                      variant={plan.popular ? "default" : "outline"}
                      className="mt-5 h-11 w-full rounded-2xl"
                    >
                      Get started
                    </Button>
                    <div className="mt-5 space-y-2.5">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#27945c]" />
                          <span className="text-sm text-black/55">{f}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
