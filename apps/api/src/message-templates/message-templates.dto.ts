import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { MessageType, MessageChannel } from '@prisma/client';

export class CreateMessageTemplateDto {
  @IsString()
  name!: string;

  @IsEnum(MessageType)
  type!: MessageType;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  subject?: string; // For email

  @IsEnum(MessageChannel)
  channel!: MessageChannel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[]; // e.g., ['studentName', 'amount', 'dueDate']
}

export class UpdateMessageTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsEnum(MessageChannel)
  channel?: MessageChannel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];
}
