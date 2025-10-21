import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto, UpdateHomeworkDto, SubmitHomeworkDto, GradeHomeworkDto } from './homework.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('homework')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HomeworkController {
  constructor(private homeworkService: HomeworkService) {}

  @Post()
  @Roles('TEACHER', 'ADMIN')
  create(@Body() dto: CreateHomeworkDto) {
    return this.homeworkService.create(dto);
  }

  @Get()
  findAll() {
    return this.homeworkService.findAll();
  }

  @Get('batch/:batchId')
  findByBatch(@Param('batchId') batchId: string) {
    return this.homeworkService.findByBatch(+batchId);
  }

  @Get('teacher/:teacherId')
  @Roles('TEACHER', 'ADMIN')
  findByTeacher(@Param('teacherId') teacherId: string) {
    return this.homeworkService.findByTeacher(+teacherId);
  }

  @Get('pending/:teacherId')
  @Roles('TEACHER', 'ADMIN')
  getPending(@Param('teacherId') teacherId: string) {
    return this.homeworkService.getPendingSubmissions(+teacherId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.homeworkService.findOne(+id);
  }

  @Put(':id')
  @Roles('TEACHER', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateHomeworkDto) {
    return this.homeworkService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('TEACHER', 'ADMIN')
  delete(@Param('id') id: string) {
    return this.homeworkService.delete(+id);
  }

  // Submissions
  @Post('submit')
  @Roles('PARENT')
  submit(@Body() dto: SubmitHomeworkDto) {
    return this.homeworkService.submitHomework(dto);
  }

  @Get('submissions/student/:studentId')
  getStudentSubmissions(@Param('studentId') studentId: string) {
    return this.homeworkService.getSubmissionsByStudent(+studentId);
  }

  @Post('grade')
  @Roles('TEACHER', 'ADMIN')
  grade(@Body() dto: GradeHomeworkDto) {
    return this.homeworkService.gradeSubmission(dto);
  }

  // ============= PHASE 6 ENHANCEMENTS =============

  // File Attachments
  @Post('submissions/:id/attachments')
  @Roles('PARENT', 'TEACHER', 'ADMIN')
  addAttachment(@Param('id') submissionId: string, @Body('fileUrl') fileUrl: string) {
    return this.homeworkService.addAttachment(+submissionId, fileUrl);
  }

  @Delete('submissions/:id/attachments')
  @Roles('PARENT', 'TEACHER', 'ADMIN')
  removeAttachment(@Param('id') submissionId: string, @Body('fileUrl') fileUrl: string) {
    return this.homeworkService.removeAttachment(+submissionId, fileUrl);
  }

  // Enhanced Status Tracking
  @Get('by-status/:status')
  @Roles('TEACHER', 'ADMIN')
  getByStatus(
    @Param('status') status: string,
    @Request() req: any
  ) {
    const { batchId, teacherId } = req.query;
    return this.homeworkService.getByStatus(status, batchId ? +batchId : undefined, teacherId ? +teacherId : undefined);
  }

  @Put(':id/status')
  @Roles('TEACHER', 'ADMIN')
  updateStatus(@Param('id') id: string, @Body('priority') priority: string) {
    return this.homeworkService.updateHomeworkStatus(+id, priority);
  }

  // Automatic Reminders
  @Post(':id/send-reminder')
  @Roles('TEACHER', 'ADMIN')
  sendReminder(@Param('id') id: string) {
    return this.homeworkService.sendReminder(+id);
  }

  @Get('reminders-due')
  @Roles('TEACHER', 'ADMIN')
  getRemindersDue() {
    return this.homeworkService.getRemindersDue();
  }

  // Calendar Integration
  @Get('calendar-feed')
  @Roles('PARENT', 'TEACHER', 'ADMIN')
  getCalendarFeed(@Request() req: any) {
    const { studentId, batchId } = req.query;
    return this.homeworkService.getCalendarFeed(studentId ? +studentId : undefined, batchId ? +batchId : undefined);
  }

  @Get('calendar-export/:batchId')
  @Roles('TEACHER', 'ADMIN')
  exportCalendar(@Param('batchId') batchId: string) {
    return this.homeworkService.exportCalendar(+batchId);
  }

  // Statistics Dashboard
  @Get('statistics')
  @Roles('TEACHER', 'ADMIN')
  getStatistics(@Request() req: any) {
    const { batchId, teacherId } = req.query;
    return this.homeworkService.getStatistics(batchId ? +batchId : undefined, teacherId ? +teacherId : undefined);
  }

  @Get('batch/:batchId/statistics')
  @Roles('TEACHER', 'ADMIN')
  getBatchStatistics(@Param('batchId') batchId: string) {
    return this.homeworkService.getBatchStatistics(+batchId);
  }

  // Gamification
  @Get('leaderboard')
  @Roles('TEACHER', 'ADMIN', 'PARENT')
  getLeaderboard(@Request() req: any) {
    const { batchId, limit } = req.query;
    return this.homeworkService.getLeaderboard(batchId ? +batchId : undefined, limit ? +limit : 10);
  }

  @Get('student/:studentId/badges')
  @Roles('TEACHER', 'ADMIN', 'PARENT')
  getStudentBadges(@Param('studentId') studentId: string) {
    return this.homeworkService.getStudentBadges(+studentId);
  }
}
