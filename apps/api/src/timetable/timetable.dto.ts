import { IsInt, IsEnum, IsString, IsOptional, Min, Max, ValidateBy, ValidationArguments, ValidationOptions } from 'class-validator';

enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

// Custom validator to check endTime > startTime
function IsTimeGreaterThan(property: string, validationOptions?: ValidationOptions) {
  return ValidateBy({
    name: 'isTimeGreaterThan',
    constraints: [property],
    validator: {
      validate(value: any, args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as any)[relatedPropertyName];
        return typeof value === 'string' && typeof relatedValue === 'string' && value > relatedValue;
      },
      defaultMessage(args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        return `${args.property} must be greater than ${relatedPropertyName}`;
      },
    },
  }, validationOptions);
}

export class CreateTimetableDto {
  @IsInt()
  batchId!: number;

  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  @IsString()
  startTime!: string;

  @IsString()
  @IsTimeGreaterThan('startTime', { message: 'End time must be after start time' })
  endTime!: string;

  @IsInt()
  @IsOptional()
  teacherId?: number;

  @IsInt()
  @IsOptional()
  levelId?: number;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  room?: string;
}

export class UpdateTimetableDto {
  @IsEnum(DayOfWeek)
  @IsOptional()
  dayOfWeek?: DayOfWeek;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  @IsTimeGreaterThan('startTime', { message: 'End time must be after start time' })
  endTime?: string;

  @IsInt()
  @IsOptional()
  teacherId?: number;

  @IsInt()
  @IsOptional()
  levelId?: number;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  room?: string;
}
