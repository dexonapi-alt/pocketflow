"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string | null;
  color: string | null;
  isSystem: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<ApiResponse<Category[]>>("/categories"),
  });
}
