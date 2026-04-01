import { Module } from "@nestjs/common";
import { PlannerService } from "./planner.service";
import { PlannerController } from "./planner.controller";

@Module({
  controllers: [PlannerController],
  providers: [PlannerService],
})
export class PlannerModule {}
