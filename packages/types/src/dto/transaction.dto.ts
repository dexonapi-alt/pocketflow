import type {
  TransactionType,
  TransactionStatus,
  TransactionSource,
} from "../enums";

export interface CreateTransactionDto {
  type: TransactionType;
  amount: number;
  categoryId?: string | null;
  note?: string | null;
  merchantName?: string | null;
  transactionDate: string;
  source?: TransactionSource;
}

export interface UpdateTransactionDto {
  type?: TransactionType;
  amount?: number;
  categoryId?: string | null;
  note?: string | null;
  merchantName?: string | null;
  transactionDate?: string;
  status?: TransactionStatus;
}

export interface TransactionDto {
  id: string;
  type: TransactionType;
  amount: number;
  note: string | null;
  merchantName: string | null;
  transactionDate: string;
  status: TransactionStatus;
  source: TransactionSource;
  category: { id: string; name: string; icon: string | null } | null;
  createdAt: string;
}

export interface TransactionQueryDto {
  page?: number;
  limit?: number;
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}
