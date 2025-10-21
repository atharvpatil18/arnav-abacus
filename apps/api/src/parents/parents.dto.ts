import { IsNumber, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class ParentDashboardDto {
  // Query parameters
  @IsOptional()
  @IsNumber()
  parentId?: number;
}

export class StudentAttendanceQueryDto {
  @IsNumber()
  studentId!: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class StudentTestsQueryDto {
  @IsNumber()
  studentId!: number;

  @IsOptional()
  @IsNumber()
  levelId?: number;
}

export class StudentFeesQueryDto {
  @IsNumber()
  studentId!: number;

  @IsOptional()
  @IsEnum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE'])
  status?: string;
}

export class StudentHomeworkQueryDto {
  @IsNumber()
  studentId!: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
