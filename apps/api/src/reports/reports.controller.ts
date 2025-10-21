import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    const stats = await this.reportsService.getDashboardStats();
    return { data: stats };
  }

  @Get('attendance-issues')
  async getAttendanceIssues() {
    const issues = await this.reportsService.getAttendanceIssues();
    return { data: issues };
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

  @Get('export/students')
  @Roles(Role.ADMIN)
  async exportStudents() {
    // Return mock CSV data for now
    return {
      success: true,
      message: 'Export feature coming soon',
      data: 'Student ID,Name,Email,Level\n1,John Doe,john@example.com,Level 1'
    };
  }

  @Get('export/attendance')
  @Roles(Role.ADMIN)
  async exportAttendance() {
    return {
      success: true,
      message: 'Export feature coming soon',
      data: 'Date,Student,Batch,Status\n2025-01-01,John Doe,Morning Batch,Present'
    };
  }

  @Get('export/fees')
  @Roles(Role.ADMIN)
  async exportFees() {
    return {
      success: true,
      message: 'Export feature coming soon',
      data: 'Invoice,Student,Amount,Status\nINV-001,John Doe,5000,Paid'
    };
  }
}
