import { IsString, IsOptional, MaxLength } from "class-validator";

export class SendMessageDto {
  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsString()
  @MaxLength(4000)
  message: string;
}
