import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBudgetDto } from "./dto/create-budget.dto";

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: {
        userId,
        name: dto.name,
        periodType: dto.periodType,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        items: {
          create: dto.items.map((item) => ({
            categoryId: item.categoryId,
            limitAmount: item.limitAmount,
          })),
        },
      },
      include: {
        items: { include: { category: true } },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId },
      include: {
        items: { include: { category: true } },
      },
      orderBy: { startDate: "desc" },
    });
  }

  async findOne(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
      include: {
        items: { include: { category: true } },
      },
    });

    if (!budget) throw new NotFoundException("Budget not found");
    return budget;
  }

  async delete(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.budget.delete({ where: { id } });
  }
}
