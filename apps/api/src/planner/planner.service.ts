import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";

@Injectable()
export class PlannerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateEventDto) {
    return this.prisma.plannerEvent.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        date: new Date(dto.date),
        color: dto.color,
        pinned: dto.pinned,
      },
    });
  }

  async findByMonth(userId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    return this.prisma.plannerEvent.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      orderBy: { date: "asc" },
    });
  }

  async findByDate(userId: string, date: string) {
    const day = new Date(date);
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return this.prisma.plannerEvent.findMany({
      where: {
        userId,
        date: { gte: start, lt: end },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(userId: string, id: string, dto: UpdateEventDto) {
    const event = await this.prisma.plannerEvent.findFirst({ where: { id, userId } });
    if (!event) throw new NotFoundException("Event not found");

    return this.prisma.plannerEvent.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async delete(userId: string, id: string) {
    const event = await this.prisma.plannerEvent.findFirst({ where: { id, userId } });
    if (!event) throw new NotFoundException("Event not found");
    return this.prisma.plannerEvent.delete({ where: { id } });
  }
}
