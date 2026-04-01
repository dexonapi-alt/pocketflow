"use client";

import { motion } from "framer-motion";
import { ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScreenshotSlot } from "./screenshot-slot";

interface HeroProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function Hero({ onGetStarted, onLogin }: HeroProps) {
  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pt-40">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#eef7ff]/60 via-[#f4efff]/30 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-1.5 text-sm text-black/60 shadow-sm">
            <Wallet className="h-3.5 w-3.5" />
            Built for real daily money tracking
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 text-[48px] font-semibold leading-[1.1] tracking-[-0.04em] text-black sm:text-[64px] lg:text-[72px]"
        >
          Track your{" "}
          <span className="bg-gradient-to-r from-[#2e7cd6] to-[#7357d8] bg-clip-text text-transparent">money</span>
          ,{" "}
          <br className="hidden sm:block" />
          plan your{" "}
          <span className="bg-gradient-to-r from-[#7357d8] to-[#d4587b] bg-clip-text text-transparent italic">future</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-[17px] leading-7 text-black/50"
        >
          A salary-based financial planner with AI insights, savings forecasts,
          and a dashboard that actually feels like a product — not a spreadsheet.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Button onClick={onGetStarted} className="h-12 rounded-2xl bg-black px-7 text-[15px] text-white hover:bg-black/90">
            Get started free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button onClick={onLogin} variant="outline" className="h-12 rounded-2xl border-black/10 px-7 text-[15px]">
            Sign in
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <div className="flex -space-x-2">
            {["bg-[#2e7cd6]", "bg-[#7357d8]", "bg-[#df7b2d]", "bg-[#27945c]", "bg-[#d4587b]"].map((bg, i) => (
              <div key={i} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[11px] font-medium text-white ${bg}`}>
                {["JD", "AK", "MR", "LS", "PT"][i]}
              </div>
            ))}
          </div>
          <p className="text-sm text-black/40">Trusted by 2,400+ users</p>
        </motion.div>
      </div>

      {/* Hero screenshot */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="mx-auto mt-16 max-w-5xl px-6"
      >
        <div className="overflow-hidden rounded-[24px] border border-black/8 bg-white shadow-[0_40px_100px_rgba(0,0,0,0.12)]">
          {/* Place hero-dashboard.png in public/screenshots/ */}
          <ScreenshotSlot name="hero-dashboard.png" height="500px" alt="PocketFlow Dashboard" />
        </div>
      </motion.div>
    </section>
  );
}
