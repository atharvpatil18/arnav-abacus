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
    const students = await this.reportsService.getAllStudents();
    const csv = this.reportsService.generateStudentsCSV(students);
    return csv;
  }

  @Get('export/attendance')
  @Roles(Role.ADMIN)
  async exportAttendance() {
    const attendance = await this.reportsService.getAllAttendance();
    const csv = this.reportsService.generateAttendanceCSV(attendance);
    return csv;
  }

  @Get('export/fees')
  @Roles(Role.ADMIN)
  async exportFees() {
    const fees = await this.reportsService.getAllFees();
    const csv = this.reportsService.generateFeesCSV(fees);
    return csv;
  }
}
