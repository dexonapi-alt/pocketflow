import type { BudgetPeriodType } from "../enums";

export interface CreateBudgetDto {
  name: string;
  periodType: BudgetPeriodType;
  startDate: string;
  endDate: string;
  items: CreateBudgetItemDto[];
}

export interface CreateBudgetItemDto {
  categoryId: string;
  limitAmount: number;
}

export interface BudgetDto {
  id: string;
  name: string;
  periodType: BudgetPeriodType;
  startDate: string;
  endDate: string;
  items: BudgetItemDto[];
}

export interface BudgetItemDto {
  id: string;
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
}
