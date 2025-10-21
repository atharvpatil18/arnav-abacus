import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  Patch,
  Query,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma.service';

interface UploadPaymentProofDto {
  feeId: number;
  amount: number;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}

interface ApprovePaymentDto {
  receiptNumber?: string;
  notes?: string;
}

interface RejectPaymentDto {
  rejectionReason: string;
}

@Controller('fee-payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeePaymentsController {
  constructor(private readonly prisma: PrismaService) {}

  // Parent uploads payment proof
  @Post('upload')
  @Roles('PARENT')
  @UseInterceptors(FileInterceptor('receipt'))
  async uploadPaymentProof(
    @Body() dto: UploadPaymentProofDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    // Create fee payment record with PENDING status
    const payment = await this.prisma.feePayment.create({
      data: {
        feeId: dto.feeId,
        amount: dto.amount,
        paymentDate: new Date(),
        paymentMethod: dto.paymentMethod,
        transactionId: dto.transactionId,
        receiptUrl: file ? `/uploads/${file.filename}` : null,
        notes: dto.notes,
        status: 'PENDING',
      },
      include: {
        fee: {
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return { success: true, payment };
  }

  // Get pending payments (for teachers/admin)
  @Get('pending')
  @Roles('TEACHER', 'ADMIN')
  async getPendingPayments() {
    return this.prisma.feePayment.findMany({
      where: { status: 'PENDING' },
      include: {
        fee: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                parentPhone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get all payments with optional filters
  @Get()
  @Roles('TEACHER', 'ADMIN')
  async getAllPayments(
    @Query('status') status?: string,
    @Query('studentId') studentId?: string,
  ) {
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (studentId) {
      where.fee = {
        studentId: parseInt(studentId),
      };
    }

    return this.prisma.feePayment.findMany({
      where,
      include: {
        fee: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                parentPhone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Teacher/Admin approves payment
  @Patch(':id/approve')
  @Roles('TEACHER', 'ADMIN')
  async approvePayment(
    @Param('id') id: string,
    @Body() dto: ApprovePaymentDto,
    @Request() req: any,
  ) {
    const payment = await this.prisma.feePayment.update({
      where: { id: parseInt(id) },
      data: {
        status: 'APPROVED',
        approvedBy: req.user.userId,
        approvedAt: new Date(),
        receiptNumber: dto.receiptNumber,
        notes: dto.notes,
      },
      include: {
        fee: true,
      },
    });

    // Update the Fee record status
    const totalPaid = await this.prisma.feePayment.aggregate({
      where: {
        feeId: payment.feeId,
        status: 'APPROVED',
      },
      _sum: {
        amount: true,
      },
    });

    const paidAmount = totalPaid._sum.amount || 0;
    const fee = payment.fee;
    
    let feeStatus: any = 'PENDING';
    if (paidAmount >= fee.amount) {
      feeStatus = 'PAID';
    } else if (paidAmount > 0) {
      feeStatus = 'PARTIAL';
    }

    await this.prisma.fee.update({
      where: { id: payment.feeId },
      data: {
        paidAmount,
        status: feeStatus,
        paidDate: feeStatus === 'PAID' ? new Date() : null,
      },
    });

    return { success: true, payment };
  }

  // Teacher/Admin rejects payment
  @Patch(':id/reject')
  @Roles('TEACHER', 'ADMIN')
  async rejectPayment(
    @Param('id') id: string,
    @Body() dto: RejectPaymentDto,
    @Request() req: any,
  ) {
    const payment = await this.prisma.feePayment.update({
      where: { id: parseInt(id) },
      data: {
        status: 'REJECTED',
        approvedBy: req.user.userId,
        approvedAt: new Date(),
        rejectionReason: dto.rejectionReason,
      },
    });

    return { success: true, payment };
  }

  // Get payment history for a student (for parents)
  @Get('student/:studentId')
  @Roles('PARENT', 'TEACHER', 'ADMIN')
  async getStudentPayments(@Param('studentId') studentId: string) {
    return this.prisma.feePayment.findMany({
      where: {
        fee: {
          studentId: parseInt(studentId),
        },
      },
      include: {
        fee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
