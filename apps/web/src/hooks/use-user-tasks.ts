"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";

interface UserTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface TaskStats { total: number; done: number; inProgress: number; todo: number }
interface ApiResponse<T> { success: boolean; data: T }

export function useUserTasks(status?: string) {
  return useQuery({
    queryKey: ["user-tasks", status],
    queryFn: () => apiGet<ApiResponse<UserTask[]>>(`/tasks${status ? `?status=${status}` : ""}`),
  });
}

export function useTaskStats() {
  return useQuery({
    queryKey: ["user-tasks", "stats"],
    queryFn: () => apiGet<ApiResponse<TaskStats>>("/tasks/stats"),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; priority?: string; dueDate?: string }) =>
      apiPost("/tasks", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-tasks"] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; status?: string; priority?: string; dueDate?: string }) =>
      apiPatch(`/tasks/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-tasks"] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/tasks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-tasks"] });
    },
  });
}
