import { Injectable, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOnboardingDto } from "./dto/create-onboarding.dto";

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOnboardingDto) {
    const existing = await this.prisma.onboardingProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException("Onboarding profile already exists");
    }

    return this.prisma.onboardingProfile.create({
      data: {
        userId,
        salaryAmount: dto.salaryAmount,
        salaryFrequency: dto.salaryFrequency,
        paydayDayOfMonth: dto.paydayDayOfMonth,
        nextPayday: dto.nextPayday ? new Date(dto.nextPayday) : null,
        startingBalance: dto.startingBalance,
        defaultSavingsTarget: dto.defaultSavingsTarget,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.onboardingProfile.findUnique({
      where: { userId },
    });
  }

  async update(userId: string, dto: Partial<CreateOnboardingDto>) {
    return this.prisma.onboardingProfile.update({
      where: { userId },
      data: {
        ...dto,
        nextPayday: dto.nextPayday ? new Date(dto.nextPayday) : undefined,
      },
    });
  }
}
