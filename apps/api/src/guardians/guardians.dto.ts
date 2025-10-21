import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateGuardianDto {
  @IsInt()
  userId!: number;

  @IsInt()
  studentId!: number;

  @IsString()
  relationship!: string; // Father, Mother, Guardian, etc.

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  canPickup?: boolean;

  @IsOptional()
  @IsBoolean()
  emergencyContact?: boolean;
}

export class UpdateGuardianDto {
  @IsOptional()
  @IsString()
  relationship?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  canPickup?: boolean;

  @IsOptional()
  @IsBoolean()
  emergencyContact?: boolean;
}
