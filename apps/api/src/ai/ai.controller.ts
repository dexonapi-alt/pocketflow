import { Controller, Post, Get, Param, Body } from "@nestjs/common";
import { AiService } from "./ai.service";
import { SendMessageDto } from "./dto/send-message.dto";
import { CurrentUser } from "../common/decorators";

@Controller("ai")
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post("chat")
  chat(
    @CurrentUser("id") userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.ai.chat(userId, dto);
  }

  @Get("conversations")
  getConversations(@CurrentUser("id") userId: string) {
    return this.ai.getConversations(userId);
  }

  @Get("conversations/:id/messages")
  getMessages(
    @CurrentUser("id") userId: string,
    @Param("id") conversationId: string,
  ) {
    return this.ai.getMessages(userId, conversationId);
  }

  @Get("weekly-pulse")
  getWeeklyPulse(@CurrentUser("id") userId: string) {
    return this.ai.getWeeklyPulse(userId);
  }

  @Get("savings-forecast")
  getSavingsForecast(@CurrentUser("id") userId: string) {
    return this.ai.getSavingsForecast(userId);
  }

  @Get("insights")
  getInsights(@CurrentUser("id") userId: string) {
    return this.ai.getInsights(userId);
  }

  @Post("insights/generate")
  generateInsights(@CurrentUser("id") userId: string) {
    return this.ai.generateInsights(userId);
  }
}
