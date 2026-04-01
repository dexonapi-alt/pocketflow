import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from "@nestjs/common";
import { UserTasksService } from "./user-tasks.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { CurrentUser } from "../common/decorators";

@Controller("tasks")
export class UserTasksController {
  constructor(private readonly tasks: UserTasksService) {}

  @Post()
  create(@CurrentUser("id") userId: string, @Body() dto: CreateTaskDto) {
    return this.tasks.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser("id") userId: string, @Query("status") status?: string) {
    return this.tasks.findAll(userId, status);
  }

  @Get("stats")
  getStats(@CurrentUser("id") userId: string) {
    return this.tasks.getStats(userId);
  }

  @Patch(":id")
  update(@CurrentUser("id") userId: string, @Param("id") id: string, @Body() dto: UpdateTaskDto) {
    return this.tasks.update(userId, id, dto);
  }

  @Delete(":id")
  delete(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.tasks.delete(userId, id);
  }
}
