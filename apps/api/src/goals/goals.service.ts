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
    return this.enrichGoal(userId, goal);
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

    const goal = await this.prisma.purchaseGoal.update({
      where: { id },
      data: dto,
    });
    return this.enrichGoal(userId, goal);
  }

  async delete(userId: string, id: string) {
    const existing = await this.prisma.purchaseGoal.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException("Goal not found");
    return this.prisma.purchaseGoal.delete({ where: { id } });
  }

  private async enrichGoal(userId: string, goal: any) {
    const { savingsPerPaycheck, onboarding } = await this.getSavingsPerPaycheck(userId);
    const targetPrice = Number(goal.targetPrice);

    let paychecksToGoal: number | null = null;
    let estimatedDate: string | null = null;
    let monthlySavingsRate = 0;

    if (savingsPerPaycheck > 0 && !goal.isAchieved && onboarding) {
      paychecksToGoal = Math.ceil(targetPrice / savingsPerPaycheck);
      monthlySavingsRate = onboarding.salaryFrequency === "BIWEEKLY"
        ? savingsPerPaycheck * 26 / 12
        : savingsPerPaycheck;

      // Land the estimated date on an actual payday
      const isBiweekly = onboarding.salaryFrequency === "BIWEEKLY";
      const now = new Date();

      if (isBiweekly) {
        // Anchor from nextPayday or paydayDayOfMonth, step by 14 days
        let anchor: Date;
        if (onboarding.nextPayday) {
          anchor = new Date(onboarding.nextPayday);
        } else if (onboarding.paydayDayOfMonth) {
          anchor = new Date(now.getFullYear(), now.getMonth(), Math.min(onboarding.paydayDayOfMonth, 28));
        } else {
          anchor = now;
        }

        // Find the next upcoming payday from today
        while (anchor < now) {
          anchor = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + 14);
        }
        // Step forward by the required number of paychecks
        const target = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + (paychecksToGoal - 1) * 14);
        estimatedDate = target.toISOString();
      } else {
        // Monthly — land on the payday of the Nth month
        const payday = onboarding.paydayDayOfMonth ?? 1;
        const target = new Date(now.getFullYear(), now.getMonth() + paychecksToGoal, Math.min(payday, 28));
        estimatedDate = target.toISOString();
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

    return {
      ...goal,
      targetPrice,
      monthlySavingsRate: Math.round(monthlySavingsRate),
      paychecksToGoal,
      monthsToGoal,
      estimatedDate,
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
}
