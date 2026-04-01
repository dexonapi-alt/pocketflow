import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsBoolean,
  Min,
  MaxLength,
} from "class-validator";

export class UpdateSavingsGoalDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  targetAmount?: number;

  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
