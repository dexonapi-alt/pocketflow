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
    const prompt = `Based on this financial data, generate 2-3 actionable insights as JSON array with fields: insightType (WEEKLY_SUMMARY|SPENDING_ALERT|SAVINGS_TIP|FORECAST), title, body, severity (INFO|WARNING|SUCCESS). Remember: "monthlyIncome" is the user's confirmed recurring salary.\n\n${JSON.stringify(summary)}`;

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
      const income = summary.monthlyIncome ?? 0;
      if (income > 0 && summary.totalRecordedExpenses > 0) {
        const allExpenses = summary.totalRecordedExpenses + (summary.monthlyFixedExpenses ?? 0);
        const savingsRate = Math.round(((income - allExpenses) / income) * 100);
        return { tip: `You're saving about ${savingsRate}% of your salary. ${savingsRate > 20 ? "Great pace — keep it up!" : "Try to cut small daily expenses to push past 20%."}` };
      }
      return { tip: income > 0 ? "Track your expenses to get personalized savings tips." : "" };
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

    // Realistic values are always computed deterministically — no AI guessing
    const monthlyIncome = summary.monthlyIncome ?? 0;
    const fixedCosts = summary.monthlyFixedExpenses ?? 0;
    const recordedExpenses = summary.totalRecordedExpenses ?? 0;
    const realisticRate = Math.max(0, monthlyIncome - fixedCosts - recordedExpenses);

    const realisticProjections = [
      { period: "1 month", realistic: Math.round(realisticRate) },
      { period: "3 months", realistic: Math.round(realisticRate * 3) },
      { period: "6 months", realistic: Math.round(realisticRate * 6) },
      { period: "1 year", realistic: Math.round(realisticRate * 12) },
    ];

    // Ask AI only for optimistic/conservative adjustments and insight
    let aiAdjustments: { projections?: any[]; insight?: string } = {};

    if (this.hasApiKey && monthlyIncome > 0) {
      const prompt = `You are a financial forecasting engine. The user's REALISTIC monthly savings is already calculated: ₱${Math.round(realisticRate).toLocaleString()}/month (income ₱${Math.round(monthlyIncome).toLocaleString()} minus fixed expenses ₱${Math.round(fixedCosts).toLocaleString()} minus recorded spending ₱${Math.round(recordedExpenses).toLocaleString()}).

DO NOT recalculate realistic — it is exact. Your job is ONLY to provide optimistic and conservative estimates, plus a one-sentence insight.

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "projections": [
    { "period": "1 month", "optimistic": <number>, "conservative": <number> },
    { "period": "3 months", "optimistic": <number>, "conservative": <number> },
    { "period": "6 months", "optimistic": <number>, "conservative": <number> },
    { "period": "1 year", "optimistic": <number>, "conservative": <number> }
  ],
  "insight": "<one sentence about their savings trajectory>"
}

Guidelines:
- Optimistic: user cuts variable spending, finds ways to save more. Should be higher than realistic.
- Conservative: unexpected costs, lifestyle inflation, irregular expenses. Should be lower than realistic.
- Be grounded in the actual numbers. Don't hallucinate.

User's financial data: ${JSON.stringify(summary)}`;

      const raw = await this.callOpenRouter(summary, [
        { role: "user", content: prompt },
      ]);

      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiAdjustments = JSON.parse(jsonMatch[0]);
        }
      } catch {}
    }

    // Merge: realistic is always deterministic, AI provides optimistic/conservative
    const aiProjections = aiAdjustments.projections ?? [];
    const periods = ["1 month", "3 months", "6 months", "1 year"];
    const multipliers = [1, 3, 6, 12];

    const projections = periods.map((period, i) => {
      const realistic = realisticProjections[i].realistic;
      const aiRow = aiProjections.find((p: any) => p.period === period);

      return {
        period,
        optimistic: aiRow?.optimistic ?? Math.round(realisticRate * 1.2 * multipliers[i]),
        realistic,
        conservative: aiRow?.conservative ?? Math.round(realisticRate * 0.85 * multipliers[i]),
      };
    });

    const insight = aiAdjustments.insight
      ?? (realisticRate > 0
        ? `Based on your income and expenses, you can save around ₱${Math.round(realisticRate).toLocaleString()} per month.`
        : "Start tracking your income and expenses to get savings projections.");

    return {
      monthlyRate: realisticRate,
      projections,
      insight,
    };
  }

  // ─── Helpers ───────────────────────────────

  private async buildFinanceSummary(userId: string) {
    const [incomeAgg, expenseAgg, saveAgg, onboarding, fixedExpenseAgg, fixedExpenses] = await Promise.all([
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
      this.prisma.fixedExpense.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      this.prisma.fixedExpense.findMany({
        where: { userId },
        select: { name: true, amount: true },
      }),
    ]);

    const income = Number(incomeAgg._sum.amount ?? 0);
    const expenses = Number(expenseAgg._sum.amount ?? 0);
    const saved = Number(saveAgg._sum.amount ?? 0);
    const monthlyFixedExpenses = Number(fixedExpenseAgg._sum.amount ?? 0);

    // Monthly salary: biweekly = 26 paychecks/year ÷ 12 months
    const rawSalary = onboarding ? Number(onboarding.salaryAmount) : 0;
    const monthlySalary = onboarding?.salaryFrequency === "BIWEEKLY"
      ? rawSalary * 26 / 12
      : rawSalary;

    return {
      monthlyIncome: monthlySalary || null,
      salaryPerPaycheck: rawSalary || null,
      salaryFrequency: onboarding?.salaryFrequency ?? null,
      currentBalance: income - expenses - saved,
      totalSaved: saved,
      totalRecordedExpenses: expenses,
      totalRecordedIncome: income,
      monthlyFixedExpenses,
      fixedExpenseBreakdown: fixedExpenses.map((fe) => ({
        name: fe.name,
        amount: Number(fe.amount),
      })),
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
      const systemPrompt = `You are a helpful personal finance assistant. The user's financial context is below. IMPORTANT: "monthlyIncome" is their confirmed recurring salary (already converted to monthly). Even if "totalRecordedExpenses" or "totalRecordedIncome" is 0, the user still earns monthlyIncome each month. "monthlyFixedExpenses" are recurring bills deducted every month.\n\nContext: ${JSON.stringify(context)}`;

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
