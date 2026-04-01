"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api-client";

interface PlanLimits {
  transactionsPerMonth: number;
  maxTasks: number;
  hasForecast: boolean;
  hasChatbot: boolean;
  chatMessagesPerDay: number;
  hasCalendar: boolean;
  hasFullInsights: boolean;
}

interface MyPlan {
  plan: string;
  limits: PlanLimits;
  expiresAt: string | null;
  isExpired: boolean;
}

interface PlanInfo {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

interface ApiResponse<T> { success: boolean; data: T }

export function useMyPlan() {
  return useQuery({
    queryKey: ["subscription", "me"],
    queryFn: () => apiGet<ApiResponse<MyPlan>>("/subscriptions/me"),
  });
}

export function useAvailablePlans() {
  return useQuery({
    queryKey: ["subscription", "plans"],
    queryFn: () => apiGet<ApiResponse<PlanInfo[]>>("/subscriptions/plans"),
  });
}

export function useUpgradePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plan: string) => apiPost("/subscriptions/upgrade", { plan }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
}

export function useFeatureGate() {
  const planQuery = useMyPlan();
  const limits = planQuery.data?.data?.limits;
  const plan = planQuery.data?.data?.plan ?? "FREE";

  return {
    plan,
    limits,
    loading: planQuery.isLoading,
    can: (feature: keyof PlanLimits) => {
      if (!limits) return false;
      const val = limits[feature];
      return val === true || (typeof val === "number" && val !== 0);
    },
  };
}
