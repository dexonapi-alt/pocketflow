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

export class UpdateFixedExpenseDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsIn(["MONTHLY", "BIWEEKLY"])
  frequency?: "MONTHLY" | "BIWEEKLY";

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDate?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
}
