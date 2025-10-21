import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateAnalyticsDto {
  @IsString()
  id: string = '';

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;
}

export class AnalyticsQueryDto {
  @IsNumber()
  studentId!: number;

  @IsNumber()
  batchId!: number;

  @IsString()
  @IsOptional()
  period?: string;
}