import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsInt, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceEntryDto {
  @IsInt()
  studentId!: number;

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @IsString()
  @IsOptional()
  note?: string;
}

export class MarkBatchAttendanceDto {
  @IsInt()
  batchId!: number;

  @IsDate()
  @Type(() => Date)
  date!: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceEntryDto)
  entries!: AttendanceEntryDto[];
}

export class GetAttendanceQueryDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  fromDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  toDate?: Date;
}