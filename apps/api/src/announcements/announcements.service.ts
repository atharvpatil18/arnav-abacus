import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto, TogglePublishDto } from './announcements.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async createAnnouncement(dto: CreateAnnouncementDto) {
    const announcement = await this.prisma.announcement.create({
      data: {
        title: dto.title,
        content: dto.content,
        targetRoles: dto.targetRoles as any,
        createdBy: dto.createdById,
        isActive: dto.isPublished ?? true,
        expiresAt: dto.expiryDate ? new Date(dto.expiryDate) : null,
      },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return announcement;
  }

  async getAllAnnouncements(role?: string, includeExpired: boolean = false) {
    const where: any = {};

    // Filter by role if provided
    if (role) {
      where.targetRoles = {
        has: role,
      };
    }

    // Exclude expired announcements by default
    if (!includeExpired) {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ];
    }

    const announcements = await this.prisma.announcement.findMany({
      where,
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return announcements;
  }

  async getPublishedAnnouncements(role?: string) {
    const where: any = {
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
    };

    if (role) {
      where.targetRoles = {
        has: role,
      };
    }

    const announcements = await this.prisma.announcement.findMany({
      where,
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return announcements;
  }

  async getAnnouncementById(id: number) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return announcement;
  }

  async updateAnnouncement(id: number, dto: UpdateAnnouncementDto) {
    await this.getAnnouncementById(id); // Check if exists

    const updateData: any = {};
    if (dto.title) updateData.title = dto.title;
    if (dto.content) updateData.content = dto.content;
    if (dto.targetRoles) updateData.targetRoles = dto.targetRoles;
    if (dto.isPublished !== undefined) updateData.isActive = dto.isPublished;
    if (dto.expiryDate) updateData.expiresAt = new Date(dto.expiryDate);

    const announcement = await this.prisma.announcement.update({
      where: { id },
      data: updateData,
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return announcement;
  }

  async togglePublish(id: number, dto: TogglePublishDto) {
    await this.getAnnouncementById(id); // Check if exists

    const announcement = await this.prisma.announcement.update({
      where: { id },
      data: { isActive: dto.isPublished },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return announcement;
  }

  async deleteAnnouncement(id: number) {
    await this.getAnnouncementById(id); // Check if exists

    await this.prisma.announcement.delete({
      where: { id },
    });

    return { message: 'Announcement deleted successfully', id };
  }

  async getAnnouncementsByRole(role: string) {
    return this.getPublishedAnnouncements(role);
  }
}
