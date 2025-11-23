import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { LevelsService } from './levels.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('levels')
@UseGuards(JwtAuthGuard)
export class LevelsController {
  constructor(private levelsService: LevelsService) {}

  @Get()
  async findAll() {
    const levels = await this.levelsService.findAll();
    return { data: levels, success: true, message: 'Levels retrieved successfully' };
  }

  @Get(':id/statistics')
  async getLevelStatistics(@Param('id') id: string) {
    const stats = await this.levelsService.getLevelStatistics(+id);
    return { data: stats, success: true, message: 'Level statistics retrieved successfully' };
  }

  @Get(':id/students')
  async getStudentsByLevel(@Param('id') id: string) {
    const students = await this.levelsService.getStudentsByLevel(+id);
    return { data: students, success: true, message: 'Students retrieved successfully' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const level = await this.levelsService.findOne(+id);
    return { data: level, success: true, message: 'Level retrieved successfully' };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() data: { name: string; passingPercent: number; description?: string }) {
    const level = await this.levelsService.create(data);
    return { data: level, success: true, message: 'Level created successfully' };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() data: { name?: string; passingPercent?: number; description?: string }
  ) {
    const level = await this.levelsService.update(+id, data);
    return { data: level, success: true, message: 'Level updated successfully' };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string) {
    await this.levelsService.delete(+id);
    return { success: true, message: 'Level deleted successfully' };
  }
}
