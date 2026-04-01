"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Shell, type PageKey } from "@/components/layout";
import { LandingPage } from "@/components/landing";
import { DashboardPage } from "@/components/dashboard";
import { TransactionsPage } from "@/components/transactions";
import { AuthPage } from "@/components/auth";
import { MorePage } from "@/components/more";
import { CalendarPage } from "@/components/calendar";
import { TaskManagerPage } from "@/components/task-manager";
import { ChatbotPage } from "@/components/chatbot";
import { SubscriptionPage } from "@/components/subscription";
import { OnboardingWizard } from "@/components/onboarding";
import { useAuth } from "@/hooks/use-auth";
import { useOnboarding } from "@/hooks/use-onboarding";

type View = "landing" | "auth" | "app";

export default function HomePage() {
  const { authenticated, loading: authLoading, logout } = useAuth();
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("landing");
  const [page, setPage] = useState<PageKey>("dashboard");
  const [onboardingDone, setOnboardingDone] = useState(false);

  // Only fetch onboarding when authenticated
  const onboardingQuery = useOnboarding(authenticated);
  const hasOnboarding = !!onboardingQuery.data?.data;

  // Sync view with auth state
  useEffect(() => {
    if (authLoading) return;
    if (authenticated) {
      setView("app");
    } else if (view === "app") {
      setView("landing");
      setOnboardingDone(false);
    }
  }, [authenticated, authLoading]);

  useEffect(() => {
    if (hasOnboarding) setOnboardingDone(true);
  }, [hasOnboarding]);

  const handleAuthSuccess = () => {
    // Clear any cached 401 errors, then refetch with the new token
    queryClient.clear();
    onboardingQuery.refetch();
  };

  const handleOnboardingComplete = () => {
    setOnboardingDone(true);
    onboardingQuery.refetch();
  };

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    setView("landing");
    setOnboardingDone(false);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfbf8]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-black/10 border-t-black" />
          <p className="mt-4 text-sm text-black/40">Loading...</p>
        </div>
      </div>
    );
  }

  // ─── Landing ───
  if (view === "landing" && !authenticated) {
    return (
      <LandingPage
        onGetStarted={() => setView("auth")}
        onLogin={() => setView("auth")}
      />
    );
  }

  // ─── Auth Form ───
  if (view === "auth" && !authenticated) {
    return (
      <div className="min-h-screen bg-[#fbfbf8] font-sans">
        <div className="mx-auto max-w-5xl px-5 py-8">
          <button
            onClick={() => setView("landing")}
            className="mb-6 text-sm text-black/50 hover:text-black transition"
          >
            &larr; Back to home
          </button>
          <AuthPage onSuccess={handleAuthSuccess} />
        </div>
      </div>
    );
  }

  // ─── App ───
  const onboardingQueryDone = !onboardingQuery.isLoading && onboardingQuery.isFetched;

  // Show loading while checking onboarding status — prevents wizard flash
  if (authenticated && !onboardingQueryDone && !onboardingDone) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfbf8]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-black/10 border-t-black" />
          <p className="mt-4 text-sm text-black/40">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const showOnboarding = authenticated && onboardingQueryDone && !hasOnboarding && !onboardingDone;

  return (
    <div className="font-sans">
      <Shell page={page} setPage={setPage} authenticated={true} onLogout={handleLogout}>
        <AnimatePresence mode="wait">
          <motion.div
            key={showOnboarding ? "onboarding" : page}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
          >
            {showOnboarding && <OnboardingWizard onComplete={handleOnboardingComplete} />}
            {!showOnboarding && (
              <>
                {page === "dashboard" && <DashboardPage />}
                {page === "transactions" && <TransactionsPage />}
                {page === "calendar" && <CalendarPage />}
                {page === "tasks" && <TaskManagerPage />}
                {page === "chatbot" && <ChatbotPage />}
                {page === "subscription" && <SubscriptionPage />}
                {page === "more" && <MorePage />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </Shell>
    </div>
  );
}
