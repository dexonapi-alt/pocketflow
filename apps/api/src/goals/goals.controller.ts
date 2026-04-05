import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { GoalsService } from "./goals.service";
import { CreateGoalDto, UpdateGoalDto } from "./dto";
import { CurrentUser } from "../common/decorators";

@Controller("goals")
export class GoalsController {
  constructor(private readonly goals: GoalsService) {}

  @Post()
  create(
    @CurrentUser("id") userId: string,
    @Body() dto: CreateGoalDto,
  ) {
    return this.goals.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser("id") userId: string) {
    return this.goals.findAll(userId);
  }

  @Get(":id")
  findOne(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ) {
    return this.goals.findOne(userId, id);
  }

  @Patch(":id")
  update(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goals.update(userId, id, dto);
  }

  @Delete(":id")
  delete(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ) {
    return this.goals.delete(userId, id);
  }
}
