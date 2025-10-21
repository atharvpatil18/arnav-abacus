import { IsDate, IsEmail, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { StudentStatus } from '@prisma/client';

export class CreateStudentDto {
  @IsString()
  firstName!: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  dob?: Date;

  @IsString()
  parentName!: string;

  @IsString()
  parentPhone!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsInt()
  currentLevel!: number;

  @IsInt()
  @IsOptional()
  batchId?: number;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;
}

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  dob?: Date;

  @IsString()
  @IsOptional()
  parentName?: string;

  @IsString()
  @IsOptional()
  parentPhone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsInt()
  @IsOptional()
  currentLevel?: number;

  @IsInt()
  @IsOptional()
  batchId?: number;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;
}