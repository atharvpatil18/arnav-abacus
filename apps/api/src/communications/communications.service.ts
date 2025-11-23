import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as nodemailer from 'nodemailer';
import {
  SendEmailDto,
  SendSmsDto,
  SendWhatsAppDto,
  SendPushDto,
  CommunicationHistoryQueryDto,
  CommunicationType,
  CommunicationStatus,
} from './communications.dto';

@Injectable()
export class CommunicationsService {
  private emailTransporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService) {
    // Setup email transporter (using Gmail as example)
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Email Service
  async sendEmail(dto: SendEmailDto, createdBy?: number) {
    const logs: any[] = [];

    for (let i = 0; i < dto.recipients.length; i++) {
      const recipient = dto.recipients[i];
      const recipientId = dto.recipientIds?.[i];

      try {
        // Send email
        await this.emailTransporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@arnavabacus.com',
          to: recipient,
          subject: dto.subject,
          text: dto.message,
          html: dto.html || dto.message,
        });

        // Log success
        const log = await this.prisma.communicationLog.create({
          data: {
            type: CommunicationType.EMAIL,
            channel: 'EMAIL',
            recipientId: recipientId || 0,
            recipientType: dto.recipientType || 'UNKNOWN',
            recipient: recipient,
            subject: dto.subject,
            message: dto.message,
            status: CommunicationStatus.SENT,
            sentAt: new Date(),

          },
        });
        logs.push(log);
      } catch (error: any) {
        // Log failure
        const log = await this.prisma.communicationLog.create({
          data: {
            type: CommunicationType.EMAIL,
            channel: 'EMAIL',
            recipientId: recipientId || 0,
            recipientType: dto.recipientType || 'UNKNOWN',
            recipient: recipient,
            subject: dto.subject,
            message: dto.message,
            status: CommunicationStatus.FAILED,
            errorMessage: error.message,

          },
        });
        logs.push(log);
      }
    }

    return {
      success: logs.filter(l => l.status === CommunicationStatus.SENT).length,
      failed: logs.filter(l => l.status === CommunicationStatus.FAILED).length,
      logs,
    };
  }

  // SMS Service (Mock for now)
  async sendSms(dto: SendSmsDto, createdBy?: number) {
    const logs: any[] = [];

    for (let i = 0; i < dto.phoneNumbers.length; i++) {
      const phoneNumber = dto.phoneNumbers[i];
      const recipientId = dto.recipientIds?.[i];

      // Mock SMS sending (replace with actual SMS service like Twilio)
      const success = true; // Mock success

      const log = await this.prisma.communicationLog.create({
        data: {
          type: CommunicationType.SMS,
          channel: 'SMS',
          recipientId: recipientId || 0,
          recipientType: dto.recipientType || 'UNKNOWN',
          recipient: phoneNumber,
          message: dto.message,
          status: success ? CommunicationStatus.SENT : CommunicationStatus.FAILED,
          sentAt: success ? new Date() : undefined,
          errorMessage: success ? undefined : 'SMS service not configured',

        },
      });
      logs.push(log);
    }

    return {
      success: logs.filter(l => l.status === CommunicationStatus.SENT).length,
      failed: logs.filter(l => l.status === CommunicationStatus.FAILED).length,
      logs,
    };
  }

  // WhatsApp Service (Mock for now)
  async sendWhatsApp(dto: SendWhatsAppDto, createdBy?: number) {
    const logs: any[] = [];

    for (let i = 0; i < dto.phoneNumbers.length; i++) {
      const phoneNumber = dto.phoneNumbers[i];
      const recipientId = dto.recipientIds?.[i];

      // Mock WhatsApp sending (replace with actual WhatsApp Business API)
      const success = true; // Mock success

      const log = await this.prisma.communicationLog.create({
        data: {
          type: CommunicationType.WHATSAPP,
          channel: 'WHATSAPP',
          recipientId: recipientId || 0,
          recipientType: dto.recipientType || 'UNKNOWN',
          recipient: phoneNumber,
          message: dto.message,
          status: success ? CommunicationStatus.SENT : CommunicationStatus.FAILED,
          sentAt: success ? new Date() : undefined,
          errorMessage: success ? undefined : 'WhatsApp service not configured',
          metadata: dto.templateId ? JSON.stringify({ templateId: dto.templateId }) : undefined,

        },
      });
      logs.push(log);
    }

    return {
      success: logs.filter(l => l.status === CommunicationStatus.SENT).length,
      failed: logs.filter(l => l.status === CommunicationStatus.FAILED).length,
      logs,
    };
  }

  // Push Notification Service (Mock for now)
  async sendPush(dto: SendPushDto, createdBy?: number) {
    const logs: any[] = [];

    // Get FCM tokens for users
    const users = await this.prisma.user.findMany({
      where: { id: { in: dto.userIds } },
      select: { id: true, email: true, fcmToken: true },
    });

    for (const user of users) {
      if (!user.fcmToken) {
        // User doesn't have FCM token
        const log = await this.prisma.communicationLog.create({
          data: {
            type: CommunicationType.PUSH,
            channel: 'PUSH',
            recipientId: user.id,
            recipientType: 'USER',
            recipient: user.email,
            message: dto.body,
            subject: dto.title,
            status: CommunicationStatus.FAILED,
            errorMessage: 'User does not have FCM token',
            metadata: JSON.stringify(dto.data || {}),

          },
        });
        logs.push(log);
        continue;
      }

      // Mock push notification sending (replace with actual FCM)
      const success = true; // Mock success

      const log = await this.prisma.communicationLog.create({
        data: {
          type: CommunicationType.PUSH,
          channel: 'PUSH',
          recipientId: user.id,
          recipientType: 'USER',
          recipient: user.email,
          message: dto.body,
          subject: dto.title,
          status: success ? CommunicationStatus.SENT : CommunicationStatus.FAILED,
          sentAt: success ? new Date() : undefined,
          errorMessage: success ? undefined : 'Push notification service not configured',
          metadata: JSON.stringify(dto.data || {}),

        },
      });
      logs.push(log);
    }

    return {
      success: logs.filter(l => l.status === CommunicationStatus.SENT).length,
      failed: logs.filter(l => l.status === CommunicationStatus.FAILED).length,
      logs,
    };
  }

  // Get communication history
  async getHistory(query: CommunicationHistoryQueryDto) {
    const where: any = {};

    if (query.recipientId) where.recipientId = query.recipientId;
    if (query.recipientType) where.recipientType = query.recipientType;
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [logs, total] = await Promise.all([
      this.prisma.communicationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit || 50,
        skip: query.offset || 0,
      }),
      this.prisma.communicationLog.count({ where }),
    ]);

    return {
      logs,
      total,
      limit: query.limit || 50,
      offset: query.offset || 0,
    };
  }

  // Get statistics
  async getStatistics(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [total, byType, byStatus] = await Promise.all([
      this.prisma.communicationLog.count({ where }),
      this.prisma.communicationLog.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
      this.prisma.communicationLog.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      byType: byType.reduce((acc, curr) => {
        acc[curr.type] = curr._count;
        return acc;
      }, {} as Record<string, number>),
      byStatus: byStatus.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // Mark as delivered (webhook handler)
  async markDelivered(logId: number) {
    return this.prisma.communicationLog.update({
      where: { id: logId },
      data: {
        status: CommunicationStatus.DELIVERED,
        deliveredAt: new Date(),
      },
    });
  }

  // Mark as read (webhook handler)
  async markRead(logId: number) {
    return this.prisma.communicationLog.update({
      where: { id: logId },
      data: {
        status: CommunicationStatus.READ,
        readAt: new Date(),
      },
    });
  }
}
