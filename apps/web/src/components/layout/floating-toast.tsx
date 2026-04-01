"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

export function FloatingToast({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.22 }}
          className="fixed bottom-5 left-5 z-50 hidden md:block"
        >
          <div className="min-w-[280px] rounded-[20px] border border-black/8 bg-white px-4 py-3 shadow-[0_18px_34px_rgba(0,0,0,0.08)]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ecfaf1] text-[#27945c]">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-black">Saved smoothly</p>
                <p className="mt-1 text-sm text-black/52">Your dashboard now feels calmer and more product-like.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
