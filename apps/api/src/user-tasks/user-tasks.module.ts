import { Module } from "@nestjs/common";
import { UserTasksService } from "./user-tasks.service";
import { UserTasksController } from "./user-tasks.controller";

@Module({
  controllers: [UserTasksController],
  providers: [UserTasksService],
})
export class UserTasksModule {}
