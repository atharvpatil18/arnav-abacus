import { IsString, IsInt, IsOptional, ValidateIf } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
  senderId!: number;

  @IsInt()
  recipientId!: number;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @ValidateIf((o) => !o.subject || o.body)
  body?: string;
}

export class MarkAsReadDto {
  @IsInt()
  messageId!: number;
}
