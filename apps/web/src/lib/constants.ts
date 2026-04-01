// ─── Design tokens (matching mockUI.tsx) ─────

export const styles = {
  shellBg: "bg-[#fbfbf8]",
  card: "rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)]",
  mutedCard: "rounded-[24px] border border-black/6 bg-[#fcfcfb]",
  input:
    "h-12 rounded-2xl border border-black/10 bg-white px-4 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
  label: "text-[11px] font-medium uppercase tracking-[0.18em] text-black/38",
  subtext: "text-[14px] leading-6 text-black/54",
  iconWrap:
    "flex h-10 w-10 items-center justify-center rounded-2xl border border-black/6",
} as const;

// ─── Category styling ────────────────────────

export const categoryStyles: Record<string, string> = {
  Food: "bg-[#fff4e8] text-[#df7b2d]",
  Income: "bg-[#ecfaf1] text-[#27945c]",
  Save: "bg-[#eef7ff] text-[#2e7cd6]",
  Transport: "bg-[#f4efff] text-[#7357d8]",
  Health: "bg-[#fff0f2] text-[#d4587b]",
  Shopping: "bg-[#fff3ec] text-[#d96f42]",
} as const;

export const defaultCategoryStyle = "bg-[#f3f3f1] text-black/60";
