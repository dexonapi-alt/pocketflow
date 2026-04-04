import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateFixedExpenseDto, UpdateFixedExpenseDto } from "./dto";

@Injectable()
export class FixedExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateFixedExpenseDto) {
    return this.prisma.fixedExpense.create({
      data: {
        userId,
        name: dto.name,
        amount: dto.amount,
        icon: dto.icon,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.fixedExpense.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(userId: string, id: string) {
    const expense = await this.prisma.fixedExpense.findFirst({
      where: { id, userId },
    });
    if (!expense) throw new NotFoundException("Fixed expense not found");
    return expense;
  }

  async update(userId: string, id: string, dto: UpdateFixedExpenseDto) {
    await this.findOne(userId, id);
    return this.prisma.fixedExpense.update({
      where: { id },
      data: dto,
    });
  }

  async delete(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.fixedExpense.delete({ where: { id } });
  }

  async getMonthlyTotal(userId: string): Promise<number> {
    const result = await this.prisma.fixedExpense.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
  }
}
