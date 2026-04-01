// ─── Salary ───
export enum SalaryFrequency {
  MONTHLY = "MONTHLY",
  BIWEEKLY = "BIWEEKLY",
}

// ─── Transactions ───
export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  SAVE = "SAVE",
  ADJUSTMENT = "ADJUSTMENT",
}

export enum TransactionStatus {
  POSTED = "POSTED",
  PENDING = "PENDING",
}

export enum TransactionSource {
  MANUAL = "MANUAL",
  SYSTEM = "SYSTEM",
  AI = "AI",
  IMPORT = "IMPORT",
}

// ─── Categories ───
export enum CategoryType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  SAVE = "SAVE",
}

// ─── Budgets ───
export enum BudgetPeriodType {
  MONTHLY = "MONTHLY",
  PAY_CYCLE = "PAY_CYCLE",
}

// ─── AI ───
export enum AiMessageRole {
  USER = "USER",
  ASSISTANT = "ASSISTANT",
  SYSTEM = "SYSTEM",
}

export enum InsightType {
  WEEKLY_SUMMARY = "WEEKLY_SUMMARY",
  SPENDING_ALERT = "SPENDING_ALERT",
  SAVINGS_TIP = "SAVINGS_TIP",
  FORECAST = "FORECAST",
}

export enum InsightSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  SUCCESS = "SUCCESS",
}
