"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";

interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  icon: string | null;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useFixedExpenses() {
  return useQuery({
    queryKey: ["fixed-expenses"],
    queryFn: () => apiGet<ApiResponse<FixedExpense[]>>("/fixed-expenses"),
  });
}

export function useCreateFixedExpense() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; amount: number; icon?: string }) =>
      apiPost("/fixed-expenses", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fixed-expenses"] });
      qc.invalidateQueries({ queryKey: ["ai", "savings-forecast"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateFixedExpense() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; amount?: number; icon?: string }) =>
      apiPatch(`/fixed-expenses/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fixed-expenses"] });
      qc.invalidateQueries({ queryKey: ["ai", "savings-forecast"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteFixedExpense() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete(`/fixed-expenses/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fixed-expenses"] });
      qc.invalidateQueries({ queryKey: ["ai", "savings-forecast"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
