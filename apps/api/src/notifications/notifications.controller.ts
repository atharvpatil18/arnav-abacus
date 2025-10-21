import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('user/:userId')
  getUserNotifications(@Param('userId') userId: string) {
    return this.notificationsService.getUserNotifications(+userId);
  }

  @Get('user/:userId/unread')
  getUnreadNotifications(@Param('userId') userId: string) {
    return this.notificationsService.getUserNotifications(+userId, true);
  }

  @Post('read/:notificationId')
  markAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationsService.markAsRead(+notificationId);
  }

  @Post('read-all/:userId')
  markAllAsRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllAsRead(+userId);
  }

  @Post('create')
  createNotification(@Body() body: { userId: number; title: string; message: string; type?: string }) {
    return this.notificationsService.createNotification(body);
  }
}
