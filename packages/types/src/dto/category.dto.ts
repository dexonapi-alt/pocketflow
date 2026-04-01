import type { CategoryType } from "../enums";

export interface CreateCategoryDto {
  name: string;
  type: CategoryType;
  icon?: string | null;
  color?: string | null;
}

export interface CategoryDto {
  id: string;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string | null;
  isSystem: boolean;
}
