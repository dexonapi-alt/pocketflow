import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";

@Injectable()
export class UserTasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTaskDto) {
    return this.prisma.userTask.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
  }

  async findAll(userId: string, status?: string) {
    return this.prisma.userTask.findMany({
      where: {
        userId,
        ...(status ? { status: status as any } : {}),
      },
      orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    });
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.userTask.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException("Task not found");

    return this.prisma.userTask.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        completedAt: dto.status === "DONE" ? new Date() : dto.status ? null : undefined,
      },
    });
  }

  async delete(userId: string, id: string) {
    const task = await this.prisma.userTask.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException("Task not found");
    return this.prisma.userTask.delete({ where: { id } });
  }

  async getStats(userId: string) {
    const [total, done, inProgress, todo] = await Promise.all([
      this.prisma.userTask.count({ where: { userId } }),
      this.prisma.userTask.count({ where: { userId, status: "DONE" } }),
      this.prisma.userTask.count({ where: { userId, status: "IN_PROGRESS" } }),
      this.prisma.userTask.count({ where: { userId, status: "TODO" } }),
    ]);
    return { total, done, inProgress, todo };
  }
}
