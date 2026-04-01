export interface CreateSavingsGoalDto {
  name: string;
  targetAmount: number;
  targetDate?: string | null;
}

export interface UpdateSavingsGoalDto {
  name?: string;
  targetAmount?: number;
  targetDate?: string | null;
  isArchived?: boolean;
}

export interface SavingsGoalDto {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  isArchived: boolean;
  createdAt: string;
}
