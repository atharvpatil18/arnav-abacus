import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto, TogglePublishDto } from './announcements.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @Roles('ADMIN')
  async createAnnouncement(@Body() dto: CreateAnnouncementDto) {
    return this.announcementsService.createAnnouncement(dto);
  }

  @Get()
  @Roles('ADMIN')
  async getAllAnnouncements(
    @Query('role') role?: string,
    @Query('includeExpired') includeExpired?: string,
  ) {
    return this.announcementsService.getAllAnnouncements(
      role,
      includeExpired === 'true',
    );
  }

  @Get('published')
  async getPublishedAnnouncements(@Query('role') role?: string) {
    return this.announcementsService.getPublishedAnnouncements(role);
  }

  @Get('role/:role')
  async getAnnouncementsByRole(@Param('role') role: string) {
    return this.announcementsService.getAnnouncementsByRole(role);
  }

  @Get(':id')
  async getAnnouncementById(@Param('id', ParseIntPipe) id: number) {
    return this.announcementsService.getAnnouncementById(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  async updateAnnouncement(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.updateAnnouncement(id, dto);
  }

  @Patch(':id/toggle-publish')
  @Roles('ADMIN')
  async togglePublish(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TogglePublishDto,
  ) {
    return this.announcementsService.togglePublish(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async deleteAnnouncement(@Param('id', ParseIntPipe) id: number) {
    return this.announcementsService.deleteAnnouncement(id);
  }
}
