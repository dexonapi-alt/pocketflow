import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
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
  @IsString()
  @MaxLength(50)
  icon?: string;
}
