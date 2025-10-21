import { Controller, Post, Get, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() data: any) {
    return this.eventsService.create(data);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
  async getAll(@Query('upcoming') upcoming?: string) {
    return this.eventsService.getAll(upcoming === 'true');
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getById(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.eventsService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.delete(id);
  }

  @Post(':id/register')
  @Roles(Role.ADMIN, Role.PARENT)
  async register(@Param('id', ParseIntPipe) eventId: number, @Body('studentId', ParseIntPipe) studentId: number) {
    return this.eventsService.register(eventId, studentId);
  }

  @Post(':id/cancel-registration')
  @Roles(Role.ADMIN, Role.PARENT)
  async cancelRegistration(@Param('id', ParseIntPipe) eventId: number, @Body('studentId', ParseIntPipe) studentId: number) {
    return this.eventsService.cancelRegistration(eventId, studentId);
  }

  @Post(':id/attendance')
  @Roles(Role.ADMIN, Role.TEACHER)
  async markAttendance(
    @Param('id', ParseIntPipe) eventId: number,
    @Body() body: { studentId: number; status: string; notes?: string }
  ) {
    return this.eventsService.markAttendance(eventId, body.studentId, body.status, body.notes);
  }

  @Get(':id/attendance-report')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getAttendanceReport(@Param('id', ParseIntPipe) eventId: number) {
    return this.eventsService.getAttendanceReport(eventId);
  }

  @Get(':id/export-calendar')
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
  async exportToCalendar(@Param('id', ParseIntPipe) eventId: number) {
    return this.eventsService.exportToCalendar(eventId);
  }
}
