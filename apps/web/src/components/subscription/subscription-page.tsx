"use client";

import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Zap, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionEyebrow } from "@/components/shared";
import { useMyPlan, useAvailablePlans, useUpgradePlan } from "@/hooks/use-subscription";

const card = "rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)]";

const planIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  FREE: Shield,
  LITE: Zap,
  PLUS: Sparkles,
  PRO_PLUS: Crown,
};

const planColors: Record<string, { bg: string; text: string; badge: string }> = {
  FREE: { bg: "bg-[#f3f3f1]", text: "text-black/60", badge: "bg-[#f3f3f1] text-black/55" },
  LITE: { bg: "bg-[#eef7ff]", text: "text-[#2e7cd6]", badge: "bg-[#eef7ff] text-[#2e7cd6]" },
  PLUS: { bg: "bg-[#f4efff]", text: "text-[#7357d8]", badge: "bg-[#f4efff] text-[#7357d8]" },
  PRO_PLUS: { bg: "bg-[#fff4e8]", text: "text-[#df7b2d]", badge: "bg-[#fff4e8] text-[#df7b2d]" },
};

export function SubscriptionPage() {
  const myPlanQuery = useMyPlan();
  const plansQuery = useAvailablePlans();
  const upgradePlan = useUpgradePlan();

  const currentPlan = myPlanQuery.data?.data?.plan ?? "FREE";
  const plans = plansQuery.data?.data ?? plansQuery.data ?? [];
  const expiresAt = myPlanQuery.data?.data?.expiresAt;

  const planOrder = ["FREE", "LITE", "PLUS", "PRO_PLUS"];

  const handleUpgrade = async (planId: string) => {
    await upgradePlan.mutateAsync(planId);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ─── Current Plan Banner ─── */}
      <Card className={card}>
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <SectionEyebrow>Current plan</SectionEyebrow>
              <h3 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-black">
                {currentPlan === "PRO_PLUS" ? "Pro+" : currentPlan.charAt(0) + currentPlan.slice(1).toLowerCase()}
              </h3>
              {expiresAt && (
                <p className="mt-1 text-sm text-black/42">
                  Renews {new Date(expiresAt).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>
            <div className={`flex h-14 w-14 items-center justify-center rounded-full ${planColors[currentPlan]?.bg ?? "bg-[#f3f3f1]"} ${planColors[currentPlan]?.text ?? ""}`}>
              {(() => { const Icon = planIcons[currentPlan] ?? Shield; return <Icon className="h-6 w-6" />; })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Plan Grid ─── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(Array.isArray(plans) ? plans : []).map((plan: any, i: number) => {
          const isCurrent = plan.id === currentPlan;
          const isHigher = planOrder.indexOf(plan.id) > planOrder.indexOf(currentPlan);
          const colors = planColors[plan.id] ?? planColors.FREE;
          const Icon = planIcons[plan.id] ?? Shield;
          const isPopular = plan.id === "PLUS";

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className={`${card} relative ${isPopular ? "ring-2 ring-[#7357d8]" : ""}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="rounded-full border-0 bg-[#7357d8] px-3 py-1 text-white">Most popular</Badge>
                  </div>
                )}
                <CardContent className="p-5 pt-6">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${colors.bg} ${colors.text}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 text-lg font-semibold text-black">{plan.name}</h4>
                  <p className="mt-1 text-sm text-black/42">{plan.description}</p>
                  <p className="mt-3">
                    <span className="text-[28px] font-semibold tracking-[-0.03em]">
                      {plan.price === 0 ? "Free" : `₱${plan.price}`}
                    </span>
                    {plan.price > 0 && <span className="text-sm text-black/42">/mo</span>}
                  </p>

                  <div className="mt-4 space-y-2">
                    {plan.features?.map((f: string) => (
                      <div key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#27945c]" />
                        <span className="text-sm text-black/58">{f}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrent || upgradePlan.isPending}
                    variant={isHigher ? "default" : "outline"}
                    className={`mt-5 h-11 w-full rounded-2xl ${
                      isCurrent ? "bg-[#f3f3f1] text-black/40 cursor-default" : ""
                    }`}
                  >
                    {isCurrent ? "Current plan" : isHigher ? "Upgrade" : "Downgrade"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
