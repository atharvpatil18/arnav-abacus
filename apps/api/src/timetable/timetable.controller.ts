import { Controller, Post, Get, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('timetable')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimetableController {
  constructor(private timetableService: TimetableService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() data: any) {
    return this.timetableService.create(data);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.timetableService.update(id, data);
  }

  @Get('batch/:id')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getByBatch(@Param('id', ParseIntPipe) batchId: number) {
    return this.timetableService.getByBatch(batchId);
  }

  @Get('teacher/:id')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getByTeacher(@Param('id', ParseIntPipe) teacherId: number) {
    return this.timetableService.getByTeacher(teacherId);
  }

  @Get('check-conflict')
  @Roles(Role.ADMIN)
  async checkConflict(
    @Query('batchId', ParseIntPipe) batchId: number,
    @Query('dayOfWeek', ParseIntPipe) dayOfWeek: number,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('teacherId', new ParseIntPipe({ optional: true })) teacherId?: number
  ) {
    const hasConflict = await this.timetableService.checkConflict(batchId, dayOfWeek, startTime, endTime, teacherId);
    return { hasConflict };
  }

  @Get('export/:batchId')
  @Roles(Role.ADMIN, Role.TEACHER)
  async exportToCalendar(@Param('batchId', ParseIntPipe) batchId: number) {
    return this.timetableService.exportToCalendar(batchId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.timetableService.delete(id);
  }
}
