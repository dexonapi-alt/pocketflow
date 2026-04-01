import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { SendMessageDto } from "./dto/send-message.dto";

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.get("OPENROUTER_API_KEY", "");
    this.baseUrl = this.config.get(
      "OPENROUTER_BASE_URL",
      "https://openrouter.ai/api/v1",
    );
  }

  private get hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey !== "your_openrouter_key";
  }

  // ─── Chat ──────────────────────────────────

  async chat(userId: string, dto: SendMessageDto) {
    // Get or create conversation
    let conversationId = dto.conversationId;

    if (!conversationId) {
      const conversation = await this.prisma.aiConversation.create({
        data: { userId, title: dto.message.slice(0, 60) },
      });
      conversationId = conversation.id;
    }

    // Store user message
    await this.prisma.aiMessage.create({
      data: {
        conversationId,
        role: "USER",
        content: dto.message,
      },
    });

    // Build context from user's finance data
    const financeSummary = await this.buildFinanceSummary(userId);

    // Get conversation history
    const history = await this.prisma.aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    // Call OpenRouter
    const assistantContent = await this.callOpenRouter(
      financeSummary,
      history.map((m) => ({ role: m.role.toLowerCase(), content: m.content })),
    );

    // Store assistant response
    const assistantMessage = await this.prisma.aiMessage.create({
      data: {
        conversationId,
        role: "ASSISTANT",
        content: assistantContent,
        model: "openrouter/auto",
      },
    });

    return {
      conversationId,
      message: assistantMessage,
    };
  }

  // ─── Conversations ─────────────────────────

  async getConversations(userId: string) {
    return this.prisma.aiConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });
  }

  async getMessages(userId: string, conversationId: string) {
    return this.prisma.aiMessage.findMany({
      where: {
        conversationId,
        conversation: { userId },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  // ─── Insights ──────────────────────────────

  async getInsights(userId: string) {
    return this.prisma.aiInsight.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { generatedAt: "desc" },
      take: 10,
    });
  }

  async generateInsights(userId: string) {
    const summary = await this.buildFinanceSummary(userId);
    const prompt = `Based on this financial data, generate 2-3 actionable insights as JSON array with fields: insightType (WEEKLY_SUMMARY|SPENDING_ALERT|SAVINGS_TIP|FORECAST), title, body, severity (INFO|WARNING|SUCCESS).\n\n${JSON.stringify(summary)}`;

    const raw = await this.callOpenRouter(summary, [
      { role: "user", content: prompt },
    ]);

    // Parse and store insights
    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      const created = await Promise.all(
        insights.map((insight: any) =>
          this.prisma.aiInsight.create({
            data: {
              userId,
              insightType: insight.insightType ?? "WEEKLY_SUMMARY",
              title: insight.title ?? "Insight",
              body: insight.body ?? "",
              severity: insight.severity ?? "INFO",
              expiresAt: new Date(Date.now() + 7 * 86_400_000),
            },
          }),
        ),
      );

      return created;
    } catch {
      return [];
    }
  }

  // ─── Weekly Pulse ──────────────────────────

  async getWeeklyPulse(userId: string) {
    const summary = await this.buildFinanceSummary(userId);

    if (!this.hasApiKey) {
      // Generate a basic tip from data
      if (summary.salary && summary.totalExpenses > 0) {
        const savingsRate = Math.round(((summary.salary - summary.totalExpenses) / summary.salary) * 100);
        return { tip: `You're saving about ${savingsRate}% of your salary. ${savingsRate > 20 ? "Great pace — keep it up!" : "Try to cut small daily expenses to push past 20%."}` };
      }
      return { tip: summary.totalIncome > 0 ? "Track your expenses to get personalized savings tips." : "" };
    }

    const prompt = `You are a concise personal finance coach. Based on this user's financial snapshot, give ONE short actionable tip in 1-2 sentences. Be specific with numbers. No greetings, no fluff.

Financial data: ${JSON.stringify(summary)}`;

    const tip = await this.callOpenRouter(summary, [
      { role: "user", content: prompt },
    ]);

    return { tip: tip || "Add more transactions to get personalized tips." };
  }

  // ─── Savings Forecast ──────────────────────

  async getSavingsForecast(userId: string) {
    const summary = await this.buildFinanceSummary(userId);

    const prompt = `You are a financial forecasting engine. Based on this user's financial data, project their possible savings for 1 month, 3 months, 6 months, and 1 year.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "monthlyRate": <number - estimated monthly savings rate>,
  "projections": [
    { "period": "1 month", "optimistic": <number>, "realistic": <number>, "conservative": <number> },
    { "period": "3 months", "optimistic": <number>, "realistic": <number>, "conservative": <number> },
    { "period": "6 months", "optimistic": <number>, "realistic": <number>, "conservative": <number> },
    { "period": "1 year", "optimistic": <number>, "realistic": <number>, "conservative": <number> }
  ],
  "insight": "<one sentence about their savings trajectory>"
}

Optimistic = if they cut spending by 20%. Realistic = current pace. Conservative = if spending increases 15%.

User's financial data: ${JSON.stringify(summary)}`;

    const raw = await this.callOpenRouter(summary, [
      { role: "user", content: prompt },
    ]);

    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}

    // Fallback: compute from salary and spending data
    // Estimate monthly expenses from total (rough: assume data spans ~1 month)
    const monthlyExpenses = summary.totalExpenses > 0 ? summary.totalExpenses : 0;
    const monthlySavings = summary.salary
      ? summary.salary - (monthlyExpenses > 0 ? monthlyExpenses : summary.salary * 0.7)
      : (summary.totalIncome > 0 ? summary.totalIncome - monthlyExpenses : 0);

    const rate = Math.max(0, monthlySavings);
    return {
      monthlyRate: rate,
      projections: [
        { period: "1 month", optimistic: Math.round(rate * 1.2), realistic: Math.round(rate), conservative: Math.round(rate * 0.85) },
        { period: "3 months", optimistic: Math.round(rate * 1.2 * 3), realistic: Math.round(rate * 3), conservative: Math.round(rate * 0.85 * 3) },
        { period: "6 months", optimistic: Math.round(rate * 1.2 * 6), realistic: Math.round(rate * 6), conservative: Math.round(rate * 0.85 * 6) },
        { period: "1 year", optimistic: Math.round(rate * 1.2 * 12), realistic: Math.round(rate * 12), conservative: Math.round(rate * 0.85 * 12) },
      ],
      insight: rate > 0
        ? `At your current pace, you could save around ₱${Math.round(rate).toLocaleString()} per month.`
        : "Start tracking your income and expenses to get savings projections.",
    };
  }

  // ─── Helpers ───────────────────────────────

  private async buildFinanceSummary(userId: string) {
    const [incomeAgg, expenseAgg, saveAgg, onboarding] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { userId, type: "INCOME" },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, type: "EXPENSE" },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, type: "SAVE" },
        _sum: { amount: true },
      }),
      this.prisma.onboardingProfile.findUnique({ where: { userId } }),
    ]);

    const income = Number(incomeAgg._sum.amount ?? 0);
    const expenses = Number(expenseAgg._sum.amount ?? 0);
    const saved = Number(saveAgg._sum.amount ?? 0);

    // Monthly salary: biweekly × 2
    const rawSalary = onboarding ? Number(onboarding.salaryAmount) : 0;
    const monthlySalary = onboarding?.salaryFrequency === "BIWEEKLY"
      ? rawSalary * 2
      : rawSalary;

    return {
      currentMoney: income - expenses - saved,
      savedMoney: saved,
      totalExpenses: expenses,
      totalIncome: income,
      salary: monthlySalary || null,
      salaryFrequency: onboarding?.salaryFrequency ?? null,
    };
  }

  private async callOpenRouter(
    context: Record<string, any>,
    messages: { role: string; content: string }[],
  ): Promise<string> {
    if (!this.hasApiKey) {
      return "";
    }

    try {
      const systemPrompt = `You are a helpful personal finance assistant. The user's financial context: ${JSON.stringify(context)}. Give concise, actionable advice.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
        }),
      });

      const data: any = await response.json();
      return data.choices?.[0]?.message?.content ?? "";
    } catch {
      return "";
    }
  }
}
