import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';

export class CreateReferralDto {
  @IsInt()
  studentId!: number;

  @IsString()
  referredBy!: string; // Name of referrer

  @IsOptional()
  @IsString()
  referredByPhone?: string;

  @IsOptional()
  @IsString()
  referralSource?: string; // Online, Friend, Existing Student, Event, etc.

  @IsOptional()
  @IsDateString()
  referralDate?: string;

  @IsOptional()
  @IsString()
  referralRewards?: string; // Any rewards given
}

export class UpdateReferralDto {
  @IsOptional()
  @IsString()
  referredBy?: string;

  @IsOptional()
  @IsString()
  referredByPhone?: string;

  @IsOptional()
  @IsString()
  referralSource?: string;

  @IsOptional()
  @IsString()
  referralRewards?: string;
}
