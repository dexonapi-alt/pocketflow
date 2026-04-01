import type { SalaryFrequency } from "../enums";

export interface CreateOnboardingDto {
  salaryAmount: number;
  salaryFrequency: SalaryFrequency;
  paydayDayOfMonth?: number | null;
  nextPayday?: string | null;
  startingBalance?: number | null;
  defaultSavingsTarget?: number | null;
}

export interface OnboardingProfileDto {
  id: string;
  salaryAmount: number;
  salaryFrequency: SalaryFrequency;
  paydayDayOfMonth: number | null;
  nextPayday: string | null;
  startingBalance: number | null;
  defaultSavingsTarget: number | null;
}
