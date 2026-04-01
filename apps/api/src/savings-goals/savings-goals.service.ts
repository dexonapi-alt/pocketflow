import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSavingsGoalDto, UpdateSavingsGoalDto } from "./dto";

@Injectable()
export class SavingsGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateSavingsGoalDto) {
    return this.prisma.savingsGoal.create({
      data: {
        userId,
        name: dto.name,
        targetAmount: dto.targetAmount,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.savingsGoal.findMany({
      where: { userId, isArchived: false },
      include: {
        allocations: {
          select: { amount: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(userId: string, id: string) {
    const goal = await this.prisma.savingsGoal.findFirst({
      where: { id, userId },
      include: {
        allocations: {
          include: {
            transaction: { select: { note: true, transactionDate: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!goal) throw new NotFoundException("Savings goal not found");
    return goal;
  }

  async update(userId: string, id: string, dto: UpdateSavingsGoalDto) {
    await this.findOne(userId, id);

    return this.prisma.savingsGoal.update({
      where: { id },
      data: {
        ...dto,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      },
    });
  }

  async delete(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.savingsGoal.delete({ where: { id } });
  }
}
