"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api-client";

interface AiInsight {
  id: string;
  insightType: string;
  title: string;
  body: string;
  severity: string;
  generatedAt: string;
  expiresAt: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useWeeklyPulse() {
  return useQuery({
    queryKey: ["ai", "weekly-pulse"],
    queryFn: () => apiGet<ApiResponse<{ tip: string }>>("/ai/weekly-pulse"),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

interface ForecastProjection {
  period: string;
  optimistic: number;
  realistic: number;
  conservative: number;
}

interface SavingsForecast {
  monthlyRate: number;
  projections: ForecastProjection[];
  insight: string;
}

export function useSavingsForecast() {
  return useQuery({
    queryKey: ["ai", "savings-forecast"],
    queryFn: () => apiGet<ApiResponse<SavingsForecast>>("/ai/savings-forecast"),
    staleTime: 60_000,
  });
}

export function useAiInsights() {
  return useQuery({
    queryKey: ["ai", "insights"],
    queryFn: () => apiGet<ApiResponse<AiInsight[]>>("/ai/insights"),
  });
}

export function useGenerateInsights() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost("/ai/insights/generate", {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai", "insights"] });
    },
  });
}

export function useChatWithAi() {
  return useMutation({
    mutationFn: (data: { conversationId?: string; message: string }) =>
      apiPost("/ai/chat", data),
  });
}
