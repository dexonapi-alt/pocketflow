import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";

const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", type: "EXPENSE", icon: "🍔" },
  { name: "Transport", type: "EXPENSE", icon: "🚗" },
  { name: "Shopping", type: "EXPENSE", icon: "🛍️" },
  { name: "Bills & Utilities", type: "EXPENSE", icon: "💡" },
  { name: "Entertainment", type: "EXPENSE", icon: "🎬" },
  { name: "Health", type: "EXPENSE", icon: "💊" },
  { name: "Education", type: "EXPENSE", icon: "📚" },
  { name: "Groceries", type: "EXPENSE", icon: "🛒" },
  { name: "Personal Care", type: "EXPENSE", icon: "💇" },
  { name: "Other Expense", type: "EXPENSE", icon: "📦" },
  { name: "Salary", type: "INCOME", icon: "💰" },
  { name: "Freelance", type: "INCOME", icon: "💻" },
  { name: "Gift", type: "INCOME", icon: "🎁" },
  { name: "Refund", type: "INCOME", icon: "🔄" },
  { name: "Other Income", type: "INCOME", icon: "💵" },
] as const;

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const existing = await this.prisma.category.count({
      where: { isSystem: true },
    });
    if (existing > 0) return;

    await this.prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((c) => ({
        name: c.name,
        type: c.type,
        icon: c.icon,
        isSystem: true,
      })),
      skipDuplicates: true,
    });
  }

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: {
        OR: [{ userId }, { isSystem: true }],
      },
      orderBy: { name: "asc" },
    });
  }

  async create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: { ...dto, userId },
    });
  }

  async delete(userId: string, id: string) {
    return this.prisma.category.deleteMany({
      where: { id, userId, isSystem: false },
    });
  }
}
