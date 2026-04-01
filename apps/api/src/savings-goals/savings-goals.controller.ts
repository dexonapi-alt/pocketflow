import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { SavingsGoalsService } from "./savings-goals.service";
import { CreateSavingsGoalDto, UpdateSavingsGoalDto } from "./dto";
import { CurrentUser } from "../common/decorators";

@Controller("savings-goals")
export class SavingsGoalsController {
  constructor(private readonly savingsGoals: SavingsGoalsService) {}

  @Post()
  create(
    @CurrentUser("id") userId: string,
    @Body() dto: CreateSavingsGoalDto,
  ) {
    return this.savingsGoals.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser("id") userId: string) {
    return this.savingsGoals.findAll(userId);
  }

  @Get(":id")
  findOne(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ) {
    return this.savingsGoals.findOne(userId, id);
  }

  @Patch(":id")
  update(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body() dto: UpdateSavingsGoalDto,
  ) {
    return this.savingsGoals.update(userId, id, dto);
  }

  @Delete(":id")
  delete(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ) {
    return this.savingsGoals.delete(userId, id);
  }
}
