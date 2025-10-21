import { IsInt, IsString, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateBatchDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @IsNotEmpty()
  levelId!: number;

  @IsInt()
  @IsOptional()
  teacherId?: number;

  @IsInt()
  @IsNotEmpty()
  dayMask!: number;

  @IsString()
  @IsNotEmpty()
  timeSlot!: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  capacity?: number;
}

export class UpdateBatchDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  levelId?: number;

  @IsInt()
  @IsOptional()
  teacherId?: number;

  @IsInt()
  @IsOptional()
  dayMask?: number;

  @IsString()
  @IsOptional()
  timeSlot?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  capacity?: number;
}

export class AddStudentToBatchDto {
  @IsInt()
  @IsNotEmpty()
  studentId!: number;
}

export interface FindAllBatchesParams {
  skip: number;
  take: number;
  search?: string;
}

export interface GetBatchStudentsParams {
  skip: number;
  take: number;
}