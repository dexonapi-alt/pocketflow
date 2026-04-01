"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Wallet,
  Target,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionEyebrow } from "@/components/shared";
import { useAuth } from "@/hooks/use-auth";

const card = "rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)]";
const iconWrap = "flex h-10 w-10 items-center justify-center rounded-2xl border border-black/6";
const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

interface AuthPageProps {
  onSuccess?: () => void;
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, login } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Please fill in email and password");
      return;
    }
    if (mode === "register" && !fullName) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (mode === "register") {
        await register({ email, password, fullName });
      } else {
        await login({ email, password });
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Wallet, label: "Track daily spend", tone: "bg-[#ecfaf1] text-[#27945c]" },
    { icon: Target, label: "Save with one tap", tone: "bg-[#eef7ff] text-[#2e7cd6]" },
    { icon: BarChart3, label: "See where money goes", tone: "bg-[#fff4e8] text-[#df7b2d]" },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      {/* ─── Auth Form ─── */}
      <Card className={card}>
        <CardContent className="p-7 sm:p-9">
          <Badge className="rounded-full border-0 bg-[#fff4e8] px-3 py-1 text-[#df7b2d] hover:bg-[#fff4e8]">
            {mode === "register" ? "Quick setup" : "Welcome back"}
          </Badge>
          <h3 className="mt-5 text-[34px] font-semibold tracking-[-0.05em] text-black">
            {mode === "register" ? "Create your account" : "Sign in"}
          </h3>
          <p className="mt-3 max-w-md text-[15px] leading-7 text-black/54">
            {mode === "register"
              ? "Clean onboarding for salary-based tracking. Enter your basics, set your pay rhythm, and start logging daily money movement."
              : "Sign in to access your dashboard and continue tracking your finances."}
          </p>

          {error && (
            <div className="mt-4 rounded-2xl bg-[#fff0f2] px-4 py-3 text-sm text-[#d4587b]">{error}</div>
          )}

          <div className="mt-8 space-y-4">
            {mode === "register" && (
              <Input className={inputClass} placeholder="Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            )}
            <Input className={inputClass} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="relative">
              <Input
                className={`${inputClass} pr-10`}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/36">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="h-12 w-full rounded-2xl bg-black text-white hover:bg-black/90"
            >
              {loading ? (mode === "register" ? "Creating account..." : "Signing in...") : "Continue"}
            </Button>
            <button
              onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }}
              className="w-full text-center text-sm text-black/50 hover:text-black transition"
            >
              {mode === "register" ? "Already have an account? Sign in" : "Don't have an account? Create one"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Info Panel ─── */}
      <Card className={card}>
        <CardContent className="grid h-full min-h-[480px] gap-5 p-7 sm:grid-cols-[1.05fr_0.95fr] sm:p-8">
          <div className="flex flex-col justify-between">
            <div>
              <SectionEyebrow>PocketFlow</SectionEyebrow>
              <h4 className="mt-2 text-[30px] font-semibold tracking-[-0.05em] text-black">Less noise. Better money decisions.</h4>
              <p className="mt-3 max-w-sm text-[15px] leading-7 text-black/54">
                Built for daily spending, savings nudges, and a dashboard that feels closer to a product team-crafted app than a generic template.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {features.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 rounded-[22px] border border-black/6 bg-[#fcfcfb] p-4">
                    <div className={`${iconWrap} ${item.tone}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-[15px] font-medium text-black">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[26px] border border-black/6 bg-[#fcfcfb] p-5">
            <SectionEyebrow>Preview</SectionEyebrow>
            <div className="mt-4 rounded-[22px] border border-black/6 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black/40">Current money</p>
                  <p className="mt-1 text-[28px] font-semibold tracking-[-0.04em]">Your data</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ecfaf1] text-[#27945c]">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ["Saved", "—"],
                  ["Spent today", "—"],
                  ["Next payday", "Set up soon"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between rounded-2xl bg-[#fafaf7] px-4 py-3">
                    <span className="text-sm text-black/46">{k}</span>
                    <span className="text-sm font-medium text-black">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
