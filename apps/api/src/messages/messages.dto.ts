import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
  fromUserId!: number;

  @IsInt()
  toUserId!: number;

  @IsInt()
  @IsOptional()
  studentId?: number;

  @IsString()
  subject!: string;

  @IsString()
  message!: string;

  @IsInt()
  @IsOptional()
  parentId?: number;
}

export class MarkAsReadDto {
  @IsInt()
  messageId!: number;
}
