import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  MaxLength,
} from "class-validator";

export class CreateSavingsGoalDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  targetAmount: number;

  @IsOptional()
  @IsDateString()
  targetDate?: string;
}
