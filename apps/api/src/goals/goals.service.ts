import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateGoalDto, UpdateGoalDto } from "./dto";

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateGoalDto) {
    const goal = await this.prisma.purchaseGoal.create({
      data: {
        userId,
        name: dto.name,
        targetPrice: dto.targetPrice,
        icon: dto.icon,
        notes: dto.notes,
      },
    });
    const enriched = await this.enrichGoal(userId, goal);

    if (dto.addToTasks) {
      await this.prisma.userTask.create({
        data: {
          userId,
          title: `Save for ${dto.name}`,
          description: `Purchase goal: ₱${Number(dto.targetPrice).toLocaleString()}`,
          priority: "MEDIUM",
          dueDate: enriched.estimatedDate
            ? new Date(enriched.estimatedDate)
            : null,
        },
      });
    }

    return enriched;
  }

  async findAll(userId: string) {
    const goals = await this.prisma.purchaseGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return Promise.all(goals.map((g) => this.enrichGoal(userId, g)));
  }

  async findOne(userId: string, id: string) {
    const goal = await this.prisma.purchaseGoal.findFirst({
      where: { id, userId },
    });
    if (!goal) throw new NotFoundException("Goal not found");
    return this.enrichGoal(userId, goal);
  }

  async update(userId: string, id: string, dto: UpdateGoalDto) {
    const existing = await this.prisma.purchaseGoal.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException("Goal not found");

    const { targetDate, ...rest } = dto;
    const goal = await this.prisma.purchaseGoal.update({
      where: { id },
      data: {
        ...rest,
        ...(targetDate !== undefined
          ? { targetDate: targetDate ? new Date(targetDate) : null }
          : {}),
      },
    });

    if (dto.isAchieved === true && !existing.isAchieved) {
      await this.prisma.userTask.updateMany({
        where: {
          userId,
          title: `Save for ${existing.name}`,
          status: { not: "DONE" },
        },
        data: { status: "DONE", completedAt: new Date() },
      });
    } else if (dto.isAchieved === false && existing.isAchieved) {
      await this.prisma.userTask.updateMany({
        where: {
          userId,
          title: `Save for ${existing.name}`,
          status: "DONE",
        },
        data: { status: "TODO", completedAt: null },
      });
    }

    return this.enrichGoal(userId, goal);
  }

  async delete(userId: string, id: string) {
    const existing = await this.prisma.purchaseGoal.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException("Goal not found");
    return this.prisma.purchaseGoal.delete({ where: { id } });
  }

  private getPaydayAnchor(onboarding: any): { anchor: Date; isBiweekly: boolean } {
    const now = new Date();
    const isBiweekly = onboarding.salaryFrequency === "BIWEEKLY";

    let anchor: Date;
    if (isBiweekly) {
      if (onboarding.nextPayday) {
        anchor = new Date(onboarding.nextPayday);
      } else if (onboarding.paydayDayOfMonth) {
        anchor = new Date(now.getFullYear(), now.getMonth(), Math.min(onboarding.paydayDayOfMonth, 28));
      } else {
        anchor = now;
      }
      while (anchor < now) {
        anchor = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + 14);
      }
    } else {
      const payday = onboarding.paydayDayOfMonth ?? 1;
      anchor = new Date(now.getFullYear(), now.getMonth(), Math.min(payday, 28));
      if (anchor < now) anchor = new Date(now.getFullYear(), now.getMonth() + 1, Math.min(payday, 28));
    }

    return { anchor, isBiweekly };
  }

  private countPaychecksToDate(anchor: Date, target: Date, isBiweekly: boolean): number {
    if (isBiweekly) {
      const diffMs = target.getTime() - anchor.getTime();
      return Math.max(1, Math.floor(diffMs / (14 * 86_400_000)) + 1);
    } else {
      return Math.max(
        1,
        (target.getFullYear() - anchor.getFullYear()) * 12 +
          (target.getMonth() - anchor.getMonth()) + 1,
      );
    }
  }

  private async enrichGoal(userId: string, goal: any) {
    const [{ savingsPerPaycheck, onboarding }, currentBalance] =
      await Promise.all([
        this.getSavingsPerPaycheck(userId),
        this.getCurrentBalance(userId),
      ]);
    const targetPrice = Number(goal.targetPrice);

    let minPaychecks: number | null = null;
    let minEstimatedDate: string | null = null;
    let estimatedDate: string | null = null;
    let paychecksToGoal: number | null = null;
    let monthlySavingsRate = 0;

    if (savingsPerPaycheck > 0 && !goal.isAchieved && onboarding) {
      const remaining = Math.max(0, targetPrice - currentBalance);
      minPaychecks = remaining > 0 ? Math.ceil(remaining / savingsPerPaycheck) : 1;
      monthlySavingsRate = onboarding.salaryFrequency === "BIWEEKLY"
        ? savingsPerPaycheck * 26 / 12
        : savingsPerPaycheck;

      const { anchor, isBiweekly } = this.getPaydayAnchor(onboarding);

      if (isBiweekly) {
        const minTarget = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + (minPaychecks - 1) * 14);
        minEstimatedDate = minTarget.toISOString();
      } else {
        const payday = onboarding.paydayDayOfMonth ?? 1;
        const minTarget = new Date(anchor.getFullYear(), anchor.getMonth() + (minPaychecks - 1), Math.min(payday, 28));
        minEstimatedDate = minTarget.toISOString();
      }

      if (goal.targetDate) {
        const custom = new Date(goal.targetDate);
        const min = new Date(minEstimatedDate);
        if (custom >= min) {
          estimatedDate = custom.toISOString();
          paychecksToGoal = this.countPaychecksToDate(anchor, custom, isBiweekly);
        } else {
          estimatedDate = minEstimatedDate;
          paychecksToGoal = minPaychecks;
        }
      } else {
        estimatedDate = minEstimatedDate;
        paychecksToGoal = minPaychecks;
      }
    }

    let monthsToGoal: number | null = null;
    if (estimatedDate) {
      const now = new Date();
      const est = new Date(estimatedDate);
      monthsToGoal = Math.max(
        1,
        Math.round(
          (est.getFullYear() - now.getFullYear()) * 12 +
            (est.getMonth() - now.getMonth()) +
            (est.getDate() - now.getDate()) / 30,
        ),
      );
    }

    let projectedBalanceAfter: number | null = null;
    if (paychecksToGoal !== null && savingsPerPaycheck > 0) {
      projectedBalanceAfter = Math.round(
        currentBalance + paychecksToGoal * savingsPerPaycheck - targetPrice,
      );
    }

    return {
      ...goal,
      targetPrice,
      monthlySavingsRate: Math.round(monthlySavingsRate),
      savingsPerPaycheck: Math.round(savingsPerPaycheck),
      paychecksToGoal,
      monthsToGoal,
      estimatedDate,
      minEstimatedDate,
      projectedBalanceAfter,
    };
  }

  private async getSavingsPerPaycheck(userId: string) {
    const [onboarding, fixedExpenses, expenseAgg, earliestExpense] =
      await Promise.all([
        this.prisma.onboardingProfile.findUnique({ where: { userId } }),
        this.prisma.fixedExpense.findMany({
          where: { userId },
          select: { amount: true, frequency: true },
        }),
        this.prisma.transaction.aggregate({
          where: { userId, type: "EXPENSE" },
          _sum: { amount: true },
        }),
        this.prisma.transaction.findFirst({
          where: { userId, type: "EXPENSE" },
          orderBy: { transactionDate: "asc" },
          select: { transactionDate: true },
        }),
      ]);

    if (!onboarding) return { savingsPerPaycheck: 0, onboarding: null };

    const rawSalary = Number(onboarding.salaryAmount);
    const isBiweekly = onboarding.salaryFrequency === "BIWEEKLY";

    const fixedPerPaycheck = fixedExpenses.reduce((total, e) => {
      const amt = Number(e.amount);
      if (isBiweekly) {
        return total + (e.frequency === "BIWEEKLY" ? amt : amt * 12 / 26);
      } else {
        return total + (e.frequency === "BIWEEKLY" ? amt * 26 / 12 : amt);
      }
    }, 0);

    const totalExpenses = Number(expenseAgg._sum.amount ?? 0);

    let avgExpensesPerPaycheck = 0;
    if (totalExpenses > 0 && earliestExpense) {
      const now = new Date();
      const start = new Date(earliestExpense.transactionDate);
      const daysDiff = Math.max(1, (now.getTime() - start.getTime()) / 86_400_000);

      if (isBiweekly) {
        const payPeriods = Math.max(1, daysDiff / 14);
        avgExpensesPerPaycheck = totalExpenses / payPeriods;
      } else {
        const months = Math.max(1, daysDiff / 30.44);
        avgExpensesPerPaycheck = totalExpenses / months;
      }
    }

    const savingsPerPaycheck = Math.max(
      0,
      rawSalary - fixedPerPaycheck - avgExpensesPerPaycheck,
    );

    return { savingsPerPaycheck, onboarding };
  }

  private async getCurrentBalance(userId: string): Promise<number> {
    const now = new Date();
    const [onboarding, income, expenses, savings] = await Promise.all([
      this.prisma.onboardingProfile.findUnique({ where: { userId } }),
      this.prisma.transaction.aggregate({
        where: { userId, type: "INCOME", transactionDate: { lte: now } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, type: "EXPENSE", transactionDate: { lte: now } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, type: "SAVE", transactionDate: { lte: now } },
        _sum: { amount: true },
      }),
    ]);

    const startingBalance = onboarding?.startingBalance
      ? Number(onboarding.startingBalance)
      : 0;

    return (
      startingBalance +
      Number(income._sum.amount ?? 0) -
      Number(expenses._sum.amount ?? 0) -
      Number(savings._sum.amount ?? 0)
    );
  }
}
