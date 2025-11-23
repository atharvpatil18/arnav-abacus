import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMessageDto } from './messages.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMessageDto) {
    // Validate required fields
    if (!dto.senderId || !dto.recipientId) {
      throw new BadRequestException('Missing required fields: senderId and recipientId are required');
    }

    if (!dto.subject && !dto.body) {
      throw new BadRequestException('At least one of subject or body must be provided');
    }

    return this.prisma.message.create({
      data: {
        senderId: dto.senderId,
        recipientId: dto.recipientId,
        subject: dto.subject,
        body: dto.body || '',
      },
    });
  }

  async findByUser(userId: number) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findConversation(userId1: number, userId2: number, studentId?: number) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, recipientId: userId2 },
          { senderId: userId2, recipientId: userId1 }
        ],
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  async findOne(id: number) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return message;
  }

  async markAsRead(messageId: number) {
    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.message.updateMany({
      where: {
        recipientId: userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  async getUnreadCount(userId: number) {
    return this.prisma.message.count({
      where: {
        recipientId: userId,
        isRead: false
      }
    });
  }

  async delete(id: number) {
    return this.prisma.message.delete({
      where: { id }
    });
  }

  async searchMessages(userId: number, query: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ],
        AND: {
          OR: [
            { subject: { contains: query, mode: 'insensitive' } },
            { body: { contains: query, mode: 'insensitive' } }
          ]
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}
