import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  MaxLength,
} from "class-validator";
import { TransactionType, TransactionStatus } from "@prisma/client";

export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount?: number;

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

  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;
}
