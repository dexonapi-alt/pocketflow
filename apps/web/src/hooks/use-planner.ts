"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";

interface PlannerEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  color: string | null;
  pinned: boolean;
}

interface ApiResponse<T> { success: boolean; data: T }

export function usePlannerMonth(year: number, month: number) {
  return useQuery({
    queryKey: ["planner", year, month],
    queryFn: () => apiGet<ApiResponse<PlannerEvent[]>>(`/planner/month?year=${year}&month=${month}`),
  });
}

export function usePlannerDate(date: string) {
  return useQuery({
    queryKey: ["planner", "date", date],
    queryFn: () => apiGet<ApiResponse<PlannerEvent[]>>(`/planner/date?date=${date}`),
    enabled: !!date,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; date: string; color?: string; pinned?: boolean }) =>
      apiPost("/planner", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["planner"] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; description?: string; date?: string; color?: string; pinned?: boolean }) =>
      apiPatch(`/planner/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["planner"] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/planner/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["planner"] }),
  });
}
