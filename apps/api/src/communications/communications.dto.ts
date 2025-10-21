import { IsString, IsInt, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum CommunicationType {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  PUSH = 'PUSH'
}

export enum CommunicationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ'
}

export class SendEmailDto {
  @IsString({ each: true })
  recipients!: string[];

  @IsString()
  subject!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  recipientIds?: number[];

  @IsOptional()
  @IsString()
  recipientType?: string;
}

export class SendSmsDto {
  @IsString({ each: true })
  phoneNumbers!: string[];

  @IsString()
  message!: string;

  @IsOptional()
  recipientIds?: number[];

  @IsOptional()
  @IsString()
  recipientType?: string;
}

export class SendWhatsAppDto {
  @IsString({ each: true })
  phoneNumbers!: string[];

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  recipientIds?: number[];

  @IsOptional()
  @IsString()
  recipientType?: string;
}

export class SendPushDto {
  @IsInt({ each: true })
  userIds!: number[];

  @IsString()
  title!: string;

  @IsString()
  body!: string;

  @IsOptional()
  data?: Record<string, any>;
}

export class CommunicationHistoryQueryDto {
  @IsOptional()
  @IsInt()
  recipientId?: number;

  @IsOptional()
  @IsString()
  recipientType?: string;

  @IsOptional()
  @IsEnum(CommunicationType)
  type?: CommunicationType;

  @IsOptional()
  @IsEnum(CommunicationStatus)
  status?: CommunicationStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  limit?: number = 50;

  @IsOptional()
  @IsInt()
  offset?: number = 0;
}
