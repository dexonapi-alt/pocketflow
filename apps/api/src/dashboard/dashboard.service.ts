import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Summary ───────────────────────────────

  async getSummary(userId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const onboarding = await this.prisma.onboardingProfile.findUnique({
      where: { userId },
    });

    // Determine current and previous cycle boundaries
    const cycleStart = this.getCycleStart(now, onboarding);
    const prevCycleStart = this.getPrevCycleStart(cycleStart, onboarding);

    const [income, expenses, savings, spentToday, spentThisCycle, spentLastCycle, fixedExpenseAgg] =
      await Promise.all([
        this.sumByType(userId, "INCOME"),
        this.sumByType(userId, "EXPENSE"),
        this.sumByType(userId, "SAVE"),
        this.sumByType(userId, "EXPENSE", startOfDay, now),
        this.sumByType(userId, "EXPENSE", cycleStart, now),
        this.sumByType(userId, "EXPENSE", prevCycleStart, cycleStart),
        this.prisma.fixedExpense.aggregate({
          where: { userId },
          _sum: { amount: true },
        }),
      ]);

    const monthlyFixedExpenses = Number(fixedExpenseAgg._sum.amount ?? 0);

    // Starting balance from onboarding
    const startingBalance = onboarding?.startingBalance
      ? Number(onboarding.startingBalance)
      : 0;

    // Current money = starting balance + income - expenses - savings
    const currentMoney = startingBalance + income - expenses - savings;

    // Monthly income: biweekly = 26 paychecks/year ÷ 12 months
    const salaryAmount = onboarding ? Number(onboarding.salaryAmount) : 0;
    const monthlyIncome = onboarding?.salaryFrequency === "BIWEEKLY"
      ? salaryAmount * 26 / 12
      : salaryAmount;

    // Safe to spend = what you actually have right now
    const safeToSpend = currentMoney;

    // Real delta vs last cycle
    let deltaVsLastCycle: number | null = null;
    if (spentLastCycle > 0) {
      deltaVsLastCycle =
        Math.round(((spentThisCycle - spentLastCycle) / spentLastCycle) * 1000) / 10;
    } else if (spentThisCycle > 0) {
      deltaVsLastCycle = 100; // first cycle with spending
    }

    // Days until payday
    let daysUntilPayday = 0;
    if (onboarding?.nextPayday) {
      const next = new Date(onboarding.nextPayday);
      daysUntilPayday = Math.max(0, Math.ceil((next.getTime() - now.getTime()) / 86_400_000));
    } else if (onboarding?.paydayDayOfMonth) {
      const today = now.getDate();
      const payday = onboarding.paydayDayOfMonth;
      daysUntilPayday = payday > today
        ? payday - today
        : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - today + payday;
    }

    return {
      currentMoney,
      savedMoney: savings,
      spentToday,
      spentThisCycle,
      remainingThisCycle: safeToSpend,
      monthlyIncome,
      monthlyFixedExpenses,
      daysUntilPayday,
      deltaVsLastCycle,
    };
  }

  // ─── Weekly Chart ──────────────────────────

  async getChart(userId: string) {
    const now = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Date ranges for last 7 days
    const ranges: { start: Date; end: Date; day: string; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      ranges.push({
        start,
        end,
        day: dayNames[start.getDay()],
        date: start.toISOString().split("T")[0],
      });
    }

    // Single query for all expenses in the 7-day window
    const weekStart = ranges[0].start;
    const weekEnd = ranges[ranges.length - 1].end;

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        transactionDate: { gte: weekStart, lt: weekEnd },
      },
      select: { amount: true, transactionDate: true },
    });

    // Group by matching each transaction to its day range
    const dailyAmounts = new Array(ranges.length).fill(0);
    for (const tx of transactions) {
      const txTime = tx.transactionDate.getTime();
      for (let j = 0; j < ranges.length; j++) {
        if (txTime >= ranges[j].start.getTime() && txTime < ranges[j].end.getTime()) {
          dailyAmounts[j] += Number(tx.amount);
          break;
        }
      }
    }

    const daily = ranges.map((r, idx) => ({
      date: r.date,
      day: r.day,
      amount: Math.round(dailyAmounts[idx]),
    }));

    return { daily };
  }

  // ─── Top Categories ────────────────────────

  async getTopCategories(userId: string) {
    const results = await this.prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "EXPENSE", categoryId: { not: null } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    });

    const total = results.reduce(
      (acc, r) => acc + Number(r._sum.amount ?? 0),
      0,
    );

    const categories = await this.prisma.category.findMany({
      where: {
        id: { in: results.map((r) => r.categoryId!).filter(Boolean) },
      },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return results.map((r) => {
      const cat = categoryMap.get(r.categoryId!);
      const amount = Number(r._sum.amount ?? 0);
      return {
        categoryId: r.categoryId,
        name: cat?.name ?? "Uncategorized",
        icon: cat?.icon ?? null,
        color: cat?.color ?? null,
        amount,
        share: total > 0 ? Math.round((amount / total) * 100) : 0,
      };
    });
  }

  // ─── Helpers ───────────────────────────────

  private getCycleStart(now: Date, onboarding: any): Date {
    if (!onboarding?.paydayDayOfMonth) {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    const payday = onboarding.paydayDayOfMonth;
    const thisMonthPayday = new Date(now.getFullYear(), now.getMonth(), payday);
    if (now >= thisMonthPayday) return thisMonthPayday;
    return new Date(now.getFullYear(), now.getMonth() - 1, payday);
  }

  private getPrevCycleStart(currentCycleStart: Date, onboarding: any): Date {
    const prev = new Date(currentCycleStart);
    if (onboarding?.salaryFrequency === "BIWEEKLY") {
      prev.setDate(prev.getDate() - 14);
    } else {
      prev.setMonth(prev.getMonth() - 1);
    }
    return prev;
  }

  private async sumByType(
    userId: string,
    type: string,
    from?: Date,
    to?: Date,
  ): Promise<number> {
    const where: Prisma.TransactionWhereInput = { userId, type: type as any };
    if (from || to) {
      where.transactionDate = {};
      if (from) where.transactionDate.gte = from;
      if (to) where.transactionDate.lte = to;
    }
    const result = await this.prisma.transaction.aggregate({
      where,
      _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
  }
}
