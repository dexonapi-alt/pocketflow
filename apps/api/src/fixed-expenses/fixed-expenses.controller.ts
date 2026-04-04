import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { FixedExpensesService } from "./fixed-expenses.service";
import { CreateFixedExpenseDto, UpdateFixedExpenseDto } from "./dto";
import { CurrentUser } from "../common/decorators";

@Controller("fixed-expenses")
export class FixedExpensesController {
  constructor(private readonly fixedExpenses: FixedExpensesService) {}

  @Post()
  create(
    @CurrentUser("id") userId: string,
    @Body() dto: CreateFixedExpenseDto,
  ) {
    return this.fixedExpenses.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser("id") userId: string) {
    return this.fixedExpenses.findAll(userId);
  }

  @Patch(":id")
  update(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body() dto: UpdateFixedExpenseDto,
  ) {
    return this.fixedExpenses.update(userId, id, dto);
  }

  @Delete(":id")
  delete(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ) {
    return this.fixedExpenses.delete(userId, id);
  }
}
