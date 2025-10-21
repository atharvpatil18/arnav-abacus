import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsEnum, IsArray, IsInt } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsArray()
  @IsString({ each: true })
  targetRoles!: string[]; // ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT']

  @IsInt()
  @IsNotEmpty()
  createdById!: number;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsString()
  @IsOptional()
  expiryDate?: string;
}

export class UpdateAnnouncementDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetRoles?: string[];

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsString()
  @IsOptional()
  expiryDate?: string;
}

export class TogglePublishDto {
  @IsBoolean()
  @IsNotEmpty()
  isPublished!: boolean;
}
