import { Controller, Get } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { CurrentUser } from "../common/decorators";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get("summary")
  getSummary(@CurrentUser("id") userId: string) {
    return this.dashboard.getSummary(userId);
  }

  @Get("chart")
  getChart(@CurrentUser("id") userId: string) {
    return this.dashboard.getChart(userId);
  }

  @Get("top-categories")
  getTopCategories(@CurrentUser("id") userId: string) {
    return this.dashboard.getTopCategories(userId);
  }
}
