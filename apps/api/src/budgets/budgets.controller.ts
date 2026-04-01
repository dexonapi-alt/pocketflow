import { Controller, Get, Post, Delete, Param, Body } from "@nestjs/common";
import { BudgetsService } from "./budgets.service";
import { CreateBudgetDto } from "./dto/create-budget.dto";
import { CurrentUser } from "../common/decorators";

@Controller("budgets")
export class BudgetsController {
  constructor(private readonly budgets: BudgetsService) {}

  @Post()
  create(
    @CurrentUser("id") userId: string,
    @Body() dto: CreateBudgetDto,
  ) {
    return this.budgets.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser("id") userId: string) {
    return this.budgets.findAll(userId);
  }

  @Get(":id")
  findOne(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ) {
    return this.budgets.findOne(userId, id);
  }

  @Delete(":id")
  delete(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ) {
    return this.budgets.delete(userId, id);
  }
}
