import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateBatchDto {
  @IsString()
  name!: string;

  @IsInt()
  levelId!: number;

  @IsInt()
  @IsOptional()
  teacherId?: number;

  @IsInt()
  @Min(0)
  @Max(127) // 7 bits for 7 days
  dayMask!: number;

  @IsString()
  timeSlot!: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  capacity?: number;
}