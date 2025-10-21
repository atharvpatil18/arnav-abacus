import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto, MarkAsReadDto } from './messages.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  create(@Body() dto: CreateMessageDto) {
    return this.messagesService.create(dto);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.messagesService.findByUser(+userId);
  }

  @Get('conversation/:userId1/:userId2')
  findConversation(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
    @Query('studentId') studentId?: string
  ) {
    return this.messagesService.findConversation(+userId1, +userId2, studentId ? +studentId : undefined);
  }

  @Get('unread/:userId')
  getUnreadCount(@Param('userId') userId: string) {
    return this.messagesService.getUnreadCount(+userId);
  }

  @Get('search/:userId')
  searchMessages(@Param('userId') userId: string, @Query('q') query: string) {
    return this.messagesService.searchMessages(+userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(+id);
  }

  @Post('read')
  markAsRead(@Body() dto: MarkAsReadDto) {
    return this.messagesService.markAsRead(dto.messageId);
  }

  @Post('read-all/:userId')
  markAllAsRead(@Param('userId') userId: string) {
    return this.messagesService.markAllAsRead(+userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.messagesService.delete(+id);
  }
}
