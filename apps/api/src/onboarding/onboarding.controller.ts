import { Controller, Post, Get, Patch, Body } from "@nestjs/common";
import { OnboardingService } from "./onboarding.service";
import { CreateOnboardingDto } from "./dto/create-onboarding.dto";
import { CurrentUser } from "../common/decorators";

@Controller("onboarding")
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Post()
  create(
    @CurrentUser("id") userId: string,
    @Body() dto: CreateOnboardingDto,
  ) {
    return this.onboarding.create(userId, dto);
  }

  @Get("me")
  findMine(@CurrentUser("id") userId: string) {
    return this.onboarding.findByUser(userId);
  }

  @Patch()
  update(
    @CurrentUser("id") userId: string,
    @Body() dto: Partial<CreateOnboardingDto>,
  ) {
    return this.onboarding.update(userId, dto);
  }
}
