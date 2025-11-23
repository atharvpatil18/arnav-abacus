import { IsString, IsInt, IsDate, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { LeaveType, LeaveStatus } from '@prisma/client';

export class CreateLeaveRequestDto {
  @IsInt()
  teacherId!: number;  // Changed from studentId since LeaveRequest is for teachers

  @IsDate()
  @Transform(({ value }) => new Date(value))
  startDate!: Date;  // Changed from fromDate to match schema

  @IsDate()
  @Transform(({ value }) => new Date(value))
  endDate!: Date;  // Changed from toDate to match schema

  @IsString()
  reason!: string;

  @IsEnum(LeaveType)
  leaveType!: LeaveType;
}

export class ApproveLeaveRequestDto {
  @IsInt()
  leaveId!: number;

  @IsEnum(LeaveStatus)
  status!: LeaveStatus;

  @IsInt()
  approvedBy!: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}
