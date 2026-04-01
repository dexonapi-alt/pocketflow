"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch } from "@/lib/api-client";

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  isArchived: boolean;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useSavingsGoals() {
  return useQuery({
    queryKey: ["savings-goals"],
    queryFn: () => apiGet<ApiResponse<SavingsGoal[]>>("/savings-goals"),
  });
}

export function useCreateSavingsGoal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; targetAmount: number; targetDate?: string }) =>
      apiPost("/savings-goals", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savings-goals"] });
    },
  });
}

export function useUpdateSavingsGoal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; targetAmount?: number; isArchived?: boolean }) =>
      apiPatch(`/savings-goals/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savings-goals"] });
    },
  });
}
