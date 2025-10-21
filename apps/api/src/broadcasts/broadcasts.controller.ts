import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BroadcastsService } from './broadcasts.service';
import { SendBroadcastDto, ResendFailedDto } from './broadcasts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('broadcasts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BroadcastsController {
  constructor(private readonly broadcastsService: BroadcastsService) {}

  @Post('send')
  @Roles('ADMIN')
  async sendBroadcast(@Body() dto: SendBroadcastDto) {
    return this.broadcastsService.sendBroadcast(dto);
  }

  @Get()
  @Roles('ADMIN')
  async getAllBroadcasts() {
    return this.broadcastsService.getAllBroadcasts();
  }

  @Get(':id')
  @Roles('ADMIN')
  async getBroadcastById(@Param('id', ParseIntPipe) id: number) {
    return this.broadcastsService.getBroadcastById(id);
  }

  @Get(':id/delivery-report')
  @Roles('ADMIN')
  async getDeliveryReport(@Param('id', ParseIntPipe) id: number) {
    return this.broadcastsService.getDeliveryReport(id);
  }

  @Post('resend-failed')
  @Roles('ADMIN')
  async resendFailed(@Body() dto: ResendFailedDto) {
    return this.broadcastsService.resendFailed(dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async deleteBroadcast(@Param('id', ParseIntPipe) id: number) {
    return this.broadcastsService.deleteBroadcast(id);
  }
}
