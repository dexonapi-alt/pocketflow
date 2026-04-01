import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  QueryTransactionDto,
} from "./dto";
import { CurrentUser } from "../common/decorators";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Post()
  create(
    @CurrentUser("id") userId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactions.create(userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser("id") userId: string,
    @Query() query: QueryTransactionDto,
  ) {
    return this.transactions.findAll(userId, query);
  }

  @Get(":id")
  findOne(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ) {
    return this.transactions.findOne(userId, id);
  }

  @Patch(":id")
  update(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactions.update(userId, id, dto);
  }

  @Delete(":id")
  delete(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ) {
    return this.transactions.delete(userId, id);
  }
}
