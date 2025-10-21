import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SendBroadcastDto, ResendFailedDto } from './broadcasts.dto';

@Injectable()
export class BroadcastsService {
  constructor(private prisma: PrismaService) {}

  async sendBroadcast(dto: SendBroadcastDto) {
    // Calculate recipient count based on target type
    let recipientCount = 0;

    if (dto.targetType === 'ALL') {
      recipientCount = await this.prisma.user.count();
    } else if (dto.targetType === 'BATCH' && dto.targetIds) {
      const students = await this.prisma.student.findMany({
        where: { batchId: { in: dto.targetIds } },
      });
      recipientCount = students.length;
    } else if (dto.targetType === 'LEVEL' && dto.targetIds) {
      const students = await this.prisma.student.findMany({
        where: { currentLevel: { in: dto.targetIds } },
      });
      recipientCount = students.length;
    } else if (dto.targetType === 'ROLE') {
      const users = await this.prisma.user.findMany({
        where: { role: { in: dto.targetIds as any } },
      });
      recipientCount = users.length;
    }

    const broadcast = await this.prisma.broadcastMessage.create({
      data: {
        title: dto.title,
        message: dto.message,
        channel: dto.channel,
        targetType: dto.targetType,
        targetIds: dto.targetIds || [],
        sentById: dto.sentById,
        recipientCount,
        deliveryStatus: 'SENT',
      },
      include: {
        sentBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // TODO: Implement actual sending logic based on channel
    // For SMS: integrate with Twilio/AWS SNS
    // For EMAIL: use nodemailer
    // For WHATSAPP: integrate with WhatsApp Business API
    // For PUSH: use Firebase Cloud Messaging

    return {
      ...broadcast,
      message: 'Broadcast queued for sending',
    };
  }

  async getAllBroadcasts() {
    const broadcasts = await this.prisma.broadcastMessage.findMany({
      include: {
        sentBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { sentAt: 'desc' },
    });

    return broadcasts;
  }

  async getBroadcastById(id: number) {
    const broadcast = await this.prisma.broadcastMessage.findUnique({
      where: { id },
      include: {
        sentBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!broadcast) {
      throw new NotFoundException(`Broadcast with ID ${id} not found`);
    }

    return broadcast;
  }

  async getDeliveryReport(id: number) {
    const broadcast = await this.getBroadcastById(id);

    // TODO: Implement delivery tracking
    // Query actual delivery status from SMS/Email/WhatsApp/Push providers

    return {
      broadcast,
      deliveryReport: {
        sent: broadcast.recipientCount,
        delivered: 0, // TODO: Track from provider
        failed: 0, // TODO: Track from provider
        pending: broadcast.recipientCount,
      },
    };
  }

  async resendFailed(dto: ResendFailedDto) {
    const broadcast = await this.getBroadcastById(dto.broadcastId);

    // TODO: Implement retry logic for failed deliveries
    // Query failed recipients and attempt resend

    return {
      message: 'Resending to failed recipients',
      broadcast,
    };
  }

  async deleteBroadcast(id: number) {
    await this.getBroadcastById(id); // Check if exists

    await this.prisma.broadcastMessage.delete({
      where: { id },
    });

    return { message: 'Broadcast deleted successfully', id };
  }
}
