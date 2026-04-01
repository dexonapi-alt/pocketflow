import { Controller, Get, Post, Body } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { CurrentUser, Public } from "../common/decorators";

@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Public()
  @Get("plans")
  getPlans() {
    return this.subscriptions.getPlans();
  }

  @Get("me")
  getMyPlan(@CurrentUser("id") userId: string) {
    return this.subscriptions.getPlan(userId);
  }

  @Post("upgrade")
  upgrade(
    @CurrentUser("id") userId: string,
    @Body("plan") plan: string,
  ) {
    return this.subscriptions.setPlan(userId, plan as any);
  }
}
