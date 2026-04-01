import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  QueryTransactionDto,
} from "./dto";

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        userId,
        type: dto.type,
        amount: dto.amount,
        categoryId: dto.categoryId,
        note: dto.note,
        merchantName: dto.merchantName,
        transactionDate: new Date(dto.transactionDate),
        source: dto.source,
      },
      include: { category: true },
    });
  }

  async findAll(userId: string, query: QueryTransactionDto) {
    const { page = 1, limit = 20 } = query;
    const where = this.buildWhere(userId, query);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, icon: true } },
        },
        orderBy: { transactionDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: { category: true },
    });

    if (!transaction) throw new NotFoundException("Transaction not found");
    return transaction;
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    await this.findOne(userId, id);

    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...dto,
        transactionDate: dto.transactionDate
          ? new Date(dto.transactionDate)
          : undefined,
      },
      include: { category: true },
    });
  }

  async delete(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.transaction.delete({ where: { id } });
  }

  // ─── Query Builder ─────────────────────────

  private buildWhere(
    userId: string,
    query: QueryTransactionDto,
  ): Prisma.TransactionWhereInput {
    const where: Prisma.TransactionWhereInput = { userId };

    if (query.type) where.type = query.type;
    if (query.categoryId) where.categoryId = query.categoryId;

    if (query.startDate || query.endDate) {
      where.transactionDate = {};
      if (query.startDate) where.transactionDate.gte = new Date(query.startDate);
      if (query.endDate) where.transactionDate.lte = new Date(query.endDate);
    }

    if (query.search) {
      where.OR = [
        { note: { contains: query.search, mode: "insensitive" } },
        { merchantName: { contains: query.search, mode: "insensitive" } },
      ];
    }

    return where;
  }
}
