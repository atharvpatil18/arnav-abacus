import { IsDate, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceDto {
  @IsNumber()
  studentId!: number;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsDate()
  @Type(() => Date)
  dueDate!: Date;

  @IsString()
  @IsOptional()
  invoiceNumber?: string;
}

export class MarkFeePaidDto {
  @IsNumber()
  @Min(0)
  paidAmount!: number;

  @IsString()
  paidBy!: string;

  @IsDate()
  @Type(() => Date)
  paidDate!: Date;
}