import { IsString, IsInt, IsDate, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { LeaveType, LeaveStatus } from '@prisma/client';

export class CreateLeaveRequestDto {
  @IsInt()
  studentId!: number;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  fromDate!: Date;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  toDate!: Date;

  @IsString()
  reason!: string;

  @IsEnum(LeaveType)
  leaveType!: LeaveType;

  @IsInt()
  appliedBy!: number;
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
