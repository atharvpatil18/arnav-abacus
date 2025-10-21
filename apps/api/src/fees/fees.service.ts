import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateInvoiceDto, MarkFeePaidDto } from './fees.dto';
import { FeeStatus } from '@prisma/client';

@Injectable()
export class FeesService {
  constructor(private prisma: PrismaService) {}

  async createInvoice(dto: CreateInvoiceDto) {
    return this.prisma.fee.create({
      data: {
        studentId: dto.studentId,
        amount: dto.amount,
        dueDate: dto.dueDate,
        invoiceNumber: dto.invoiceNumber || `INV-${Date.now()}`,
        status: FeeStatus.PENDING,
        paidAmount: 0,
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });
  }

  async markPaid(id: number, dto: MarkFeePaidDto) {
    const invoice = await this.prisma.fee.findUnique({
      where: { id }
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const status = dto.paidAmount >= invoice.amount 
      ? FeeStatus.PAID 
      : dto.paidAmount > 0 
        ? FeeStatus.PARTIAL 
        : FeeStatus.PENDING;

    return this.prisma.fee.update({
      where: { id },
      data: {
        paidAmount: dto.paidAmount,
        paidDate: dto.paidDate,
        paidBy: dto.paidBy,
        status,
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });
  }

  async findByStudent(studentId: number) {
    return this.prisma.fee.findMany({
      where: { studentId },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        dueDate: 'desc',
      }
    });
  }
}