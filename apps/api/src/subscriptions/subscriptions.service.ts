import { Injectable, ForbiddenException } from "@nestjs/common";
import { SubscriptionPlan } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

// ─── Feature Access Matrix ──────────────────
// FREE: dashboard, 10 transactions/month, 2 tasks, no forecast, no chatbot
// LITE: dashboard, 50 transactions/month, 10 tasks, no forecast, limited chatbot (5 msgs/day)
// PLUS: dashboard, unlimited transactions, unlimited tasks, forecast, chatbot (50 msgs/day), calendar
// PRO_PLUS: everything unlimited

const PLAN_LIMITS: Record<SubscriptionPlan, {
  transactionsPerMonth: number;
  maxTasks: number;
  hasForecast: boolean;
  hasChatbot: boolean;
  chatMessagesPerDay: number;
  hasCalendar: boolean;
  hasFullInsights: boolean;
}> = {
  FREE: {
    transactionsPerMonth: 10,
    maxTasks: 2,
    hasForecast: false,
    hasChatbot: false,
    chatMessagesPerDay: 0,
    hasCalendar: false,
    hasFullInsights: false,
  },
  LITE: {
    transactionsPerMonth: 50,
    maxTasks: 10,
    hasForecast: false,
    hasChatbot: true,
    chatMessagesPerDay: 5,
    hasCalendar: false,
    hasFullInsights: false,
  },
  PLUS: {
    transactionsPerMonth: -1,
    maxTasks: -1,
    hasForecast: true,
    hasChatbot: true,
    chatMessagesPerDay: 50,
    hasCalendar: true,
    hasFullInsights: true,
  },
  PRO_PLUS: {
    transactionsPerMonth: -1,
    maxTasks: -1,
    hasForecast: true,
    hasChatbot: true,
    chatMessagesPerDay: -1,
    hasCalendar: true,
    hasFullInsights: true,
  },
};

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlan(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    const plan = sub?.plan ?? "FREE";
    const limits = PLAN_LIMITS[plan];
    const isExpired = sub?.expiresAt ? new Date(sub.expiresAt) < new Date() : false;
    const activePlan = isExpired ? "FREE" : plan;

    return {
      plan: activePlan,
      limits: PLAN_LIMITS[activePlan],
      expiresAt: sub?.expiresAt ?? null,
      isExpired,
    };
  }

  async setPlan(userId: string, plan: SubscriptionPlan) {
    const expiresAt = plan === "FREE" ? null : new Date(Date.now() + 30 * 86_400_000);

    return this.prisma.subscription.upsert({
      where: { userId },
      create: { userId, plan, expiresAt },
      update: { plan, expiresAt, startsAt: new Date() },
    });
  }

  async checkFeature(userId: string, feature: keyof typeof PLAN_LIMITS.FREE) {
    const { limits } = await this.getPlan(userId);
    return limits[feature];
  }

  async guardFeature(userId: string, feature: string) {
    const { plan, limits } = await this.getPlan(userId);
    const featureKey = feature as keyof typeof limits;

    if (featureKey in limits) {
      const value = limits[featureKey];
      if (value === false || value === 0) {
        throw new ForbiddenException(
          `This feature requires a higher plan. Current: ${plan}`,
        );
      }
    }
  }

  async getTransactionCount(userId: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.prisma.transaction.count({
      where: { userId, createdAt: { gte: startOfMonth } },
    });
  }

  async canCreateTransaction(userId: string): Promise<boolean> {
    const { limits } = await this.getPlan(userId);
    if (limits.transactionsPerMonth === -1) return true;
    const count = await this.getTransactionCount(userId);
    return count < limits.transactionsPerMonth;
  }

  async canCreateTask(userId: string): Promise<boolean> {
    const { limits } = await this.getPlan(userId);
    if (limits.maxTasks === -1) return true;
    const count = await this.prisma.userTask.count({ where: { userId } });
    return count < limits.maxTasks;
  }

  getPlans() {
    return [
      {
        id: "FREE",
        name: "Free",
        price: 0,
        description: "Basic tracking",
        features: ["10 transactions/month", "2 tasks", "Dashboard"],
      },
      {
        id: "LITE",
        name: "Lite",
        price: 99,
        description: "Extended limits",
        features: ["50 transactions/month", "10 tasks", "Limited chatbot (5 msgs/day)", "Dashboard"],
      },
      {
        id: "PLUS",
        name: "Plus",
        price: 249,
        description: "Full access",
        features: ["Unlimited transactions", "Unlimited tasks", "AI Chatbot (50 msgs/day)", "Savings forecast", "Calendar & planner", "Full insights"],
      },
      {
        id: "PRO_PLUS",
        name: "Pro+",
        price: 499,
        description: "Everything unlimited",
        features: ["Everything in Plus", "Unlimited AI chatbot", "Priority support", "Early access to new features"],
      },
    ];
  }
}
