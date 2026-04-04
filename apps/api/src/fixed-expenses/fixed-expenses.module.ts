import { Module } from "@nestjs/common";
import { FixedExpensesService } from "./fixed-expenses.service";
import { FixedExpensesController } from "./fixed-expenses.controller";

@Module({
  controllers: [FixedExpensesController],
  providers: [FixedExpensesService],
  exports: [FixedExpensesService],
})
export class FixedExpensesModule {}
