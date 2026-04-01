import { Controller, Get, Patch, Param } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { CurrentUser } from "../common/decorators";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  findAll(@CurrentUser("id") userId: string) {
    return this.notifications.findAll(userId);
  }

  @Patch(":id/read")
  markRead(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ) {
    return this.notifications.markRead(userId, id);
  }

  @Patch("read-all")
  markAllRead(@CurrentUser("id") userId: string) {
    return this.notifications.markAllRead(userId);
  }
}
