import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto, UpdateTestDto, BulkCreateTestDto } from './tests.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('tests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  create(@Body() createTestDto: CreateTestDto) {
    return this.testsService.create(createTestDto);
  }

  @Post('bulk')
  @Roles(Role.ADMIN, Role.TEACHER)
  createBulk(@Body() bulkCreateTestDto: BulkCreateTestDto) {
    return this.testsService.createBulk(bulkCreateTestDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
  findAll(
    @Query('studentId') studentId?: string,
    @Query('level') level?: string
  ) {
    if (studentId) {
      return this.testsService.findByStudent(+studentId);
    }
    return this.testsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
  findOne(@Param('id') id: string) {
    return this.testsService.findOne(+id);
  }

  @Get('summary/:studentId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
  getStudentSummary(
    @Param('studentId') studentId: string,
    @Query('level') level?: string
  ) {
    if (level) {
      return this.testsService.getStudentLevelSummary(+studentId, +level);
    }
    return this.testsService.getStudentAllLevelsSummary(+studentId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto) {
    return this.testsService.update(+id, updateTestDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.testsService.remove(+id);
  }

  @Get('batch/:batchId')
  @Roles(Role.ADMIN, Role.TEACHER)
  findByBatchAndDate(
    @Param('batchId') batchId: string,
    @Query('date') dateString?: string
  ) {
    const date = dateString ? new Date(dateString) : new Date();
    return this.testsService.findByBatchAndDate(+batchId, date);
  }
}
