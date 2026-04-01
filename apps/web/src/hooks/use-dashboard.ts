"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";

interface DashboardSummary {
  currentMoney: number;
  savedMoney: number;
  spentToday: number;
  spentThisCycle: number;
  remainingThisCycle: number;
  monthlyIncome: number;
  daysUntilPayday: number;
  deltaVsLastCycle: number | null;
}

interface DailySpend {
  date: string;
  day: string;
  amount: number;
}

interface DashboardChart {
  daily: DailySpend[];
}

interface TopCategory {
  categoryId: string;
  name: string;
  icon: string | null;
  color: string | null;
  amount: number;
  share: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => apiGet<ApiResponse<DashboardSummary>>("/dashboard/summary"),
  });
}

export function useDashboardChart() {
  return useQuery({
    queryKey: ["dashboard", "chart"],
    queryFn: () => apiGet<ApiResponse<DashboardChart>>("/dashboard/chart"),
  });
}

export function useTopCategories() {
  return useQuery({
    queryKey: ["dashboard", "top-categories"],
    queryFn: () => apiGet<ApiResponse<TopCategory[]>>("/dashboard/top-categories"),
  });
}
