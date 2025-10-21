import { IsString, IsNotEmpty, IsNumber, IsInt, IsOptional, IsArray, Min } from 'class-validator';

export class CreateFeeTemplateDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  applicableLevels!: number[]; // Which levels this template applies to

  @IsString()
  @IsNotEmpty()
  frequency!: string; // MONTHLY, QUARTERLY, YEARLY, ONE_TIME

  @IsString()
  @IsOptional()
  category?: string; // TUITION, EXAM, MATERIAL, EVENT, OTHER
}

export class UpdateFeeTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  applicableLevels?: number[];

  @IsString()
  @IsOptional()
  frequency?: string;

  @IsString()
  @IsOptional()
  category?: string;
}
