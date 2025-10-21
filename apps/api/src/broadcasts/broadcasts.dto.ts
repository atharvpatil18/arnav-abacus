import { IsString, IsNotEmpty, IsInt, IsArray, IsEnum, IsOptional } from 'class-validator';

export class SendBroadcastDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsEnum(['SMS', 'EMAIL', 'WHATSAPP', 'PUSH'])
  @IsNotEmpty()
  channel!: 'SMS' | 'EMAIL' | 'WHATSAPP' | 'PUSH';

  @IsEnum(['ALL', 'BATCH', 'LEVEL', 'ROLE'])
  @IsNotEmpty()
  targetType!: 'ALL' | 'BATCH' | 'LEVEL' | 'ROLE';

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  targetIds?: number[]; // Batch IDs, Level numbers, or empty for ALL

  @IsInt()
  @IsNotEmpty()
  sentById!: number;
}

export class ResendFailedDto {
  @IsInt()
  @IsNotEmpty()
  broadcastId!: number;
}
