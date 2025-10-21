import { IsInt, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class StudentProgressReportDto {
  @IsInt()
  studentId!: number;

  @IsOptional()
  @IsInt()
  levelId?: number;
}

export class BatchComparisonDto {
  @IsInt({ each: true })
  batchIds!: number[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class RevenueReportDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  levelId?: number;
}

export class ExpenseReportDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['SALARY', 'RENT', 'UTILITIES', 'MATERIALS', 'MARKETING', 'MAINTENANCE', 'OTHER'])
  category?: string;
}

export class RetentionAnalysisDto {
  @IsOptional()
  @IsInt()
  months?: number = 12;
}

export class AttendanceTrendDto {
  @IsOptional()
  @IsInt()
  batchId?: number;

  @IsOptional()
  @IsInt()
  studentId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class TestPerformanceDto {
  @IsOptional()
  @IsInt()
  testId?: number;

  @IsOptional()
  @IsInt()
  batchId?: number;

  @IsOptional()
  @IsInt()
  levelId?: number;
}
