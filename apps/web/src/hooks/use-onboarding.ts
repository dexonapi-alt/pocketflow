"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { isAuthenticated } from "@/lib/auth";

interface OnboardingProfile {
  id: string;
  salaryAmount: number;
  salaryFrequency: string;
  paydayDayOfMonth: number | null;
  nextPayday: string | null;
  startingBalance: number | null;
  defaultSavingsTarget: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useOnboarding(enabled = true) {
  return useQuery({
    queryKey: ["onboarding"],
    queryFn: () => apiGet<ApiResponse<OnboardingProfile | null>>("/onboarding/me"),
    enabled: enabled && isAuthenticated(),
    retry: false,
  });
}
