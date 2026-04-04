import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { OnboardingModule } from "./onboarding/onboarding.module";
import { CategoriesModule } from "./categories/categories.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { BudgetsModule } from "./budgets/budgets.module";
import { SavingsGoalsModule } from "./savings-goals/savings-goals.module";
import { FixedExpensesModule } from "./fixed-expenses/fixed-expenses.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { AiModule } from "./ai/ai.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { PlannerModule } from "./planner/planner.module";
import { UserTasksModule } from "./user-tasks/user-tasks.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SubscriptionsModule,
    AuthModule,
    UsersModule,
    OnboardingModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    SavingsGoalsModule,
    FixedExpensesModule,
    DashboardModule,
    AiModule,
    NotificationsModule,
    PlannerModule,
    UserTasksModule,
  ],
})
export class AppModule {}
