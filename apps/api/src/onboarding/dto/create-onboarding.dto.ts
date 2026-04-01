import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsDateString,
} from "class-validator";
import { SalaryFrequency } from "@prisma/client";

export class CreateOnboardingDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salaryAmount: number;

  @IsEnum(SalaryFrequency)
  salaryFrequency: SalaryFrequency;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  paydayDayOfMonth?: number;

  @IsOptional()
  @IsDateString()
  nextPayday?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  startingBalance?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  defaultSavingsTarget?: number;
}
