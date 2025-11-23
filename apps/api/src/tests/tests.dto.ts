import { Type } from 'class-transformer';
import { IsString, IsInt, IsDate, IsArray, IsNumber, ValidateNested, Min, Max } from 'class-validator';

export class SubjectMark {
  @IsString()
  name!: string;

  @IsNumber()
  @Min(0)
  obtained!: number;

  @IsNumber()
  @Min(1)
  total!: number;
}

export class CreateTestDto {
  @IsInt()
  studentId!: number;

  @IsInt()
  batchId!: number;

  @IsInt()
  level!: number;

  @IsString()
  testName!: string;

  @IsDate()
  @Type(() => Date)
  date!: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectMark)
  subjects!: SubjectMark[];
}

export class UpdateTestDto {
  @IsString()
  testName!: string;

  @IsDate()
  @Type(() => Date)
  date!: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectMark)
  subjects!: SubjectMark[];
}

export class StudentTestResultDto {
  @IsInt()
  studentId!: number;

  @IsInt()
  level!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectMark)
  subjects!: SubjectMark[];
}

export class BulkCreateTestDto {
  @IsInt()
  batchId!: number;

  @IsString()
  testName!: string;

  @IsDate()
  @Type(() => Date)
  date!: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentTestResultDto)
  results!: StudentTestResultDto[];
}