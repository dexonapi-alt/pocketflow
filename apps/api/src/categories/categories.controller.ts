import { Controller, Get, Post, Delete, Param, Body } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CurrentUser } from "../common/decorators";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  findAll(@CurrentUser("id") userId: string) {
    return this.categories.findAll(userId);
  }

  @Post()
  create(
    @CurrentUser("id") userId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categories.create(userId, dto);
  }

  @Delete(":id")
  delete(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ) {
    return this.categories.delete(userId, id);
  }
}
