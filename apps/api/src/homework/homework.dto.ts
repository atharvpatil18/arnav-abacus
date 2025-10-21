import { IsString, IsInt, IsOptional, IsDate, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { SubmissionStatus } from '@prisma/client';

export class CreateHomeworkDto {
  @IsInt()
  batchId!: number;

  @IsInt()
  teacherId!: number;

  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  dueDate!: Date;

  @IsString()
  @IsOptional()
  attachments?: string;
}

export class UpdateHomeworkDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  dueDate?: Date;

  @IsString()
  @IsOptional()
  attachments?: string;
}

export class SubmitHomeworkDto {
  @IsInt()
  homeworkId!: number;

  @IsInt()
  studentId!: number;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class GradeHomeworkDto {
  @IsInt()
  submissionId!: number;

  @IsString()
  grade!: string;

  @IsString()
  @IsOptional()
  feedback?: string;

  @IsInt()
  gradedBy!: number;
}
