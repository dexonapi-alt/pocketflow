import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from "@nestjs/common";
import { PlannerService } from "./planner.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { CurrentUser } from "../common/decorators";

@Controller("planner")
export class PlannerController {
  constructor(private readonly planner: PlannerService) {}

  @Post()
  create(@CurrentUser("id") userId: string, @Body() dto: CreateEventDto) {
    return this.planner.create(userId, dto);
  }

  @Get("month")
  findByMonth(
    @CurrentUser("id") userId: string,
    @Query("year") year: string,
    @Query("month") month: string,
  ) {
    return this.planner.findByMonth(userId, parseInt(year), parseInt(month));
  }

  @Get("date")
  findByDate(
    @CurrentUser("id") userId: string,
    @Query("date") date: string,
  ) {
    return this.planner.findByDate(userId, date);
  }

  @Patch(":id")
  update(@CurrentUser("id") userId: string, @Param("id") id: string, @Body() dto: UpdateEventDto) {
    return this.planner.update(userId, id, dto);
  }

  @Delete(":id")
  delete(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.planner.delete(userId, id);
  }
}
