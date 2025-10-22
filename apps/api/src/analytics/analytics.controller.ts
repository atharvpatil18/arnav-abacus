import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './analytics.dto';

@Controller('analytics')
@ApiTags('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('student/:id/performance')
  @ApiOperation({ summary: 'Get student performance metrics' })
  @ApiResponse({ status: 200, description: 'Returns student performance data' })
  @Roles('ADMIN', 'TEACHER', 'PARENT')
  async getStudentPerformance(@Param('id') id: string) {
    return this.analyticsService.getStudentPerformanceMetrics(parseInt(id, 10));
  }

  @Get('batch/:id/attendance')
  @ApiOperation({ summary: 'Get batch attendance statistics' })
  @ApiResponse({ status: 200, description: 'Returns batch attendance data' })
  @Roles('ADMIN', 'TEACHER')
  async getBatchAttendance(@Param('id') id: string) {
    return this.analyticsService.getBatchAttendanceStats(parseInt(id, 10));
  }

  @Get('fees')
  @ApiOperation({ summary: 'Get fees collection analytics' })
  @ApiResponse({ status: 200, description: 'Returns fees collection data' })
  @Roles('ADMIN')
  async getFeesCollection(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.analyticsService.getFeesCollection(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('monthly-revenue')
  @ApiOperation({ summary: 'Get monthly revenue analytics' })
  @ApiResponse({ status: 200, description: 'Returns monthly revenue data including fees collected and expenditures' })
  @Roles('ADMIN')
  async getMonthlyRevenue(
    @Query('start') startDate: string,
    @Query('end') endDate: string,
  ) {
    return this.analyticsService.getMonthlyRevenue(
      new Date(startDate),
      new Date(endDate),
    );
  }
}