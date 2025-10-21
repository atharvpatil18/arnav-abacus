import { Controller, Post, Get, Body, Query, UseGuards, Request } from '@nestjs/common';
import { CommunicationsService } from './communications.service';
import {
  SendEmailDto,
  SendSmsDto,
  SendWhatsAppDto,
  SendPushDto,
  CommunicationHistoryQueryDto,
} from './communications.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('communications')
@UseGuards(JwtAuthGuard)
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Post('email/send')
  @Roles('ADMIN', 'TEACHER')
  async sendEmail(@Body() dto: SendEmailDto, @Request() req: any) {
    return this.communicationsService.sendEmail(dto, req.user.id);
  }

  @Post('sms/send')
  @Roles('ADMIN', 'TEACHER')
  async sendSms(@Body() dto: SendSmsDto, @Request() req: any) {
    return this.communicationsService.sendSms(dto, req.user.id);
  }

  @Post('whatsapp/send')
  @Roles('ADMIN', 'TEACHER')
  async sendWhatsApp(@Body() dto: SendWhatsAppDto, @Request() req: any) {
    return this.communicationsService.sendWhatsApp(dto, req.user.id);
  }

  @Post('push/send')
  @Roles('ADMIN', 'TEACHER')
  async sendPush(@Body() dto: SendPushDto, @Request() req: any) {
    return this.communicationsService.sendPush(dto, req.user.id);
  }

  @Get('history')
  @Roles('ADMIN', 'TEACHER')
  async getHistory(@Query() query: CommunicationHistoryQueryDto) {
    return this.communicationsService.getHistory(query);
  }

  @Get('statistics')
  @Roles('ADMIN')
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.communicationsService.getStatistics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
