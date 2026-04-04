import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
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
  @IsString()
  @MaxLength(50)
  icon?: string;
}
