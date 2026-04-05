import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  Max,
  MaxLength,
} from "class-validator";

export class CreateFixedExpenseDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsIn(["MONTHLY", "BIWEEKLY"])
  frequency?: "MONTHLY" | "BIWEEKLY";

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDate?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
}
