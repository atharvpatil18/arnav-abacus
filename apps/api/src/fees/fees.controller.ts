import { Controller, Post, Body, Get, Query, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FeesService } from './fees.service';
import { CreateInvoiceDto, MarkFeePaidDto } from './fees.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('fees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeesController {
  constructor(private feesService: FeesService) {}

  @Post()
  @Roles(Role.ADMIN)
  async createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.feesService.createInvoice(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
  async listInvoices(@Query('studentId', ParseIntPipe) studentId: number) {
    return this.feesService.findByStudent(studentId);
  }

  @Post(':id/mark-paid')
  @Roles(Role.ADMIN)
  async markPaid(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MarkFeePaidDto
  ) {
    return this.feesService.markPaid(id, dto);
  }
}
