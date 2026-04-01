import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  MaxLength,
} from "class-validator";
import { TransactionType, TransactionSource } from "@prisma/client";

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  merchantName?: string;

  @IsDateString()
  transactionDate: string;

  @IsOptional()
  @IsEnum(TransactionSource)
  source?: TransactionSource;
}
