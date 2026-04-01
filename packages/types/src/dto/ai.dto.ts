import type { AiMessageRole, InsightType, InsightSeverity } from "../enums";

export interface SendMessageDto {
  conversationId?: string | null;
  message: string;
}

export interface AiConversationDto {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiMessageDto {
  id: string;
  role: AiMessageRole;
  content: string;
  model: string | null;
  createdAt: string;
}

export interface AiInsightDto {
  id: string;
  insightType: InsightType;
  title: string;
  body: string;
  severity: InsightSeverity;
  generatedAt: string;
  expiresAt: string | null;
}
