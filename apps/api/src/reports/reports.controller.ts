import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('student-level-summary/:id')
  async getStudentLevelSummary(@Param('id', ParseIntPipe) studentId: number) {
    return this.reportsService.getStudentLevelSummary(studentId);
  }

  @Get('batch-attendance/:id')
  async getBatchAttendance(
    @Param('id', ParseIntPipe) batchId: number,
    @Query('from') fromDate?: Date,
    @Query('to') toDate?: Date
  ) {
    return this.reportsService.getBatchAttendance(batchId, fromDate, toDate);
  }
}
