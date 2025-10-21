import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { CreateReferralDto, UpdateReferralDto } from './referrals.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  create(@Body() createReferralDto: CreateReferralDto) {
    return this.referralsService.create(createReferralDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  findAll() {
    return this.referralsService.findAll();
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  getStats() {
    return this.referralsService.getStats();
  }

  @Get('student/:studentId')
  @Roles(Role.ADMIN, Role.TEACHER)
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.referralsService.findByStudent(studentId);
  }

  @Get('referrer')
  @Roles(Role.ADMIN, Role.TEACHER)
  findByReferrer(@Query('name') referrerName: string) {
    return this.referralsService.findByReferrer(referrerName);
  }

  @Get('source/:source')
  @Roles(Role.ADMIN, Role.TEACHER)
  findBySource(@Param('source') source: string) {
    return this.referralsService.findBySource(source);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReferralDto: UpdateReferralDto,
  ) {
    return this.referralsService.update(id, updateReferralDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.referralsService.remove(id);
  }
}
