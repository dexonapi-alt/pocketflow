"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  note: string | null;
  merchantName: string | null;
  transactionDate: string;
  status: string;
  source: string;
  category: { id: string; name: string; icon: string | null } | null;
  createdAt: string;
}

interface TransactionsResponse {
  success: boolean;
  data: {
    data: Transaction[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
}

interface CreateTransactionInput {
  type: string;
  amount: number;
  categoryId?: string;
  note?: string;
  merchantName?: string;
  transactionDate: string;
  source?: string;
}

export function useTransactions(params?: {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.type) searchParams.set("type", params.type);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.startDate) searchParams.set("startDate", params.startDate);
  if (params?.endDate) searchParams.set("endDate", params.endDate);

  const qs = searchParams.toString();

  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () => apiGet<TransactionsResponse>(`/transactions${qs ? `?${qs}` : ""}`),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionInput) =>
      apiPost("/transactions", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<CreateTransactionInput>) =>
      apiPatch(`/transactions/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete(`/transactions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
