import {
  IsString,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";
import { BudgetPeriodType } from "@prisma/client";

export class CreateBudgetItemDto {
  @IsString()
  categoryId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  limitAmount: number;
}

export class CreateBudgetDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEnum(BudgetPeriodType)
  periodType: BudgetPeriodType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetItemDto)
  items: CreateBudgetItemDto[];
}
