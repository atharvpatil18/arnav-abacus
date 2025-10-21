import { Controller, Post, Get, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('holidays')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HolidaysController {
  constructor(private holidaysService: HolidaysService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() data: any) {
    return this.holidaysService.create(data);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
  async getAll(@Query('year', new ParseIntPipe({ optional: true })) year?: number) {
    return this.holidaysService.getAll(year);
  }

  @Get('upcoming')
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
  async getUpcoming(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.holidaysService.getUpcoming(limit || 10);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.holidaysService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.holidaysService.delete(id);
  }

  @Post('makeup-classes')
  @Roles(Role.ADMIN)
  async scheduleMakeupClass(@Body() data: any) {
    return this.holidaysService.scheduleMakeupClass(data);
  }

  @Get('makeup-classes')
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
  async getMakeupClasses(@Query('batchId', new ParseIntPipe({ optional: true })) batchId?: number) {
    return this.holidaysService.getMakeupClasses(batchId);
  }

  @Put('makeup-classes/:id/notify')
  @Roles(Role.ADMIN)
  async updateMakeupNotification(@Param('id', ParseIntPipe) id: number) {
    return this.holidaysService.updateMakeupStatus(id, true);
  }
}
