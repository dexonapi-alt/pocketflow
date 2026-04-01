import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

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
