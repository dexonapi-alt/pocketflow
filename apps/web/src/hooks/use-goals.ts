"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";

export interface PurchaseGoal {
  id: string;
  name: string;
  targetPrice: number;
  icon: string | null;
  notes: string | null;
  isAchieved: boolean;
  monthlySavingsRate: number;
  paychecksToGoal: number | null;
  monthsToGoal: number | null;
  estimatedDate: string | null;
  projectedBalanceAfter: number | null;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: () => apiGet<ApiResponse<PurchaseGoal[]>>("/goals"),
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; targetPrice: number; icon?: string; notes?: string; addToTasks?: boolean }) =>
      apiPost("/goals", data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      if (variables.addToTasks) {
        qc.invalidateQueries({ queryKey: ["user-tasks"] });
      }
    },
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; targetPrice?: number; icon?: string; notes?: string; isAchieved?: boolean }) =>
      apiPatch(`/goals/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["user-tasks"] });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete(`/goals/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}
