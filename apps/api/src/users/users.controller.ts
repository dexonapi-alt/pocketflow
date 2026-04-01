import { Controller, Get, Patch, Body } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CurrentUser } from "../common/decorators";

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  getProfile(@CurrentUser("id") userId: string) {
    return this.users.findById(userId);
  }

  @Patch("me")
  updateProfile(
    @CurrentUser("id") userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.users.update(userId, dto);
  }
}
