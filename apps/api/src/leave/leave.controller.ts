import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto, ApproveLeaveRequestDto } from './leave.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('leave')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  constructor(private leaveService: LeaveService) {}

  @Post()
  @Roles('PARENT', 'ADMIN')
  create(@Body() dto: CreateLeaveRequestDto) {
    return this.leaveService.create(dto);
  }

  @Get()
  @Roles('TEACHER', 'ADMIN')
  findAll() {
    return this.leaveService.findAll();
  }

  @Get('pending')
  @Roles('TEACHER', 'ADMIN')
  findPending() {
    return this.leaveService.findPending();
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.leaveService.findByStudent(+studentId);
  }

  @Get('stats/:studentId')
  getStats(@Param('studentId') studentId: string) {
    return this.leaveService.getLeaveStats(+studentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveService.findOne(+id);
  }

  @Post('approve')
  @Roles('TEACHER', 'ADMIN')
  approveOrReject(@Body() dto: ApproveLeaveRequestDto) {
    return this.leaveService.approveOrReject(dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  delete(@Param('id') id: string) {
    return this.leaveService.delete(+id);
  }
}
