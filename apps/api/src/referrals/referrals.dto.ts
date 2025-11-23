import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';

export class CreateReferralDto {
  @IsInt()
  studentId!: number;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  referralSource?: string;

  @IsOptional()
  @IsString()
  referredBy?: string;

  @IsOptional()
  @IsString()
  referredByPhone?: string;

  @IsOptional()
  @IsString()
  referralCode?: string;

  @IsOptional()
  @IsDateString()
  referralDate?: string;

  @IsOptional()
  @IsDateString()
  conversionDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateReferralDto {
  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  referralSource?: string;

  @IsOptional()
  @IsString()
  referredBy?: string;

  @IsOptional()
  @IsString()
  referredByPhone?: string;

  @IsOptional()
  @IsString()
  referralCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
