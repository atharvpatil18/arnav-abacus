import { Controller, Post, Body, Get, Query, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkBatchAttendanceDto, GetAttendanceQueryDto } from './attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { UserId } from '../auth/user-id.decorator';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('batch')
  @Roles(Role.TEACHER, Role.ADMIN)
  async markBatchAttendance(
    @UserId() userId: number,
    @Body() dto: MarkBatchAttendanceDto
  ) {
    return this.attendanceService.markBatchAttendance(userId, dto);
  }

  @Get('student/:id')
  @Roles(Role.TEACHER, Role.ADMIN, Role.PARENT)
  async getStudentAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetAttendanceQueryDto
  ) {
    const attendances = await this.attendanceService.findByStudent(id);
    if (query.fromDate || query.toDate) {
      return this.attendanceService.getStudentAttendanceSummary(id, query.fromDate, query.toDate);
    }
    return attendances;
  }

  @Get('batch/:id/date/:date')
  @Roles(Role.TEACHER, Role.ADMIN)
  async getBatchAttendanceByDate(
    @Param('id', ParseIntPipe) batchId: number,
    @Param('date') dateStr: string
  ) {
    const date = new Date(dateStr);
    return this.attendanceService.findByBatchAndDate(batchId, date);
  }

  @Get('student/:id/summary')
  @Roles(Role.TEACHER, Role.ADMIN, Role.PARENT)
  async getStudentAttendanceSummary(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetAttendanceQueryDto
  ) {
    return this.attendanceService.getStudentAttendanceSummary(id, query.fromDate, query.toDate);
  }
}
