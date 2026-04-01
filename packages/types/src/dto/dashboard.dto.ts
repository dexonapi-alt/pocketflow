export interface DashboardSummaryDto {
  currentMoney: number;
  savedMoney: number;
  spentToday: number;
  spentThisCycle: number;
  remainingThisCycle: number;
  daysUntilPayday: number;
  deltaVsLastCycle: number | null;
}

export interface DashboardChartDto {
  daily: DailySpendDto[];
}

export interface DailySpendDto {
  date: string;
  day: string;
  amount: number;
}

export interface TopCategoryDto {
  categoryId: string;
  name: string;
  icon: string | null;
  color: string | null;
  amount: number;
  share: number;
}
