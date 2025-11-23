import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMessageTemplateDto, UpdateMessageTemplateDto } from './message-templates.dto';
import { MessageType, MessageChannel } from '@prisma/client';

@Injectable()
export class MessageTemplatesService {
  constructor(private prisma: PrismaService) {}

  // Replace variables in template content
  replaceVariables(content: string, variables: Record<string, any>): string {
    let result = content;
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, variables[key]?.toString() || '');
    });
    return result;
  }

  async create(data: CreateMessageTemplateDto) {
    return this.prisma.messageTemplate.create({
      data: {
        name: data.name,
        messageType: data.type,
        body: data.content,
        subject: data.subject,
        channel: data.channel,
        variables: data.variables || [],
        isActive: true,
      },
    });
  }

  async findAll(type?: MessageType) {
    const where = type ? { messageType: type } : {};
    return this.prisma.messageTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const template = await this.prisma.messageTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Message template with ID ${id} not found`);
    }

    return template;
  }

  async findByType(type: MessageType) {
    return this.prisma.messageTemplate.findMany({
      where: { messageType: type, isActive: true },
    });
  }

  async update(id: number, data: UpdateMessageTemplateDto) {
    await this.findOne(id); // Verify exists

    return this.prisma.messageTemplate.update({
      where: { id },
      data: {
        name: data.name,
        body: data.content,
        subject: data.subject,
        channel: data.channel,
        variables: data.variables,
      },
    });
  }

  async toggleActive(id: number) {
    const template = await this.findOne(id);

    return this.prisma.messageTemplate.update({
      where: { id },
      data: { isActive: !template.isActive },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Verify exists

    return this.prisma.messageTemplate.delete({
      where: { id },
    });
  }

  // Get template and replace variables
  async getProcessedTemplate(
    id: number,
    variables: Record<string, any>,
  ): Promise<{ content: string; subject?: string; channel: MessageChannel }> {
    const template = await this.findOne(id);

    return {
      content: this.replaceVariables(template.body, variables),
      subject: template.subject
        ? this.replaceVariables(template.subject, variables)
        : undefined,
      channel: template.channel,
    };
  }

  // Seed default templates (create multiple versions for different channels)
  async seedDefaultTemplates() {
    const defaults = [
      {
        name: 'Fee Reminder - SMS',
        messageType: MessageType.FEE_REMINDER,
        body:
          'Dear {{parentName}}, fee of ₹{{amount}} for {{studentName}} is due on {{dueDate}}. Please pay at earliest.',
        channel: MessageChannel.SMS,
        variables: ['parentName', 'studentName', 'amount', 'dueDate'],
      },
      {
        name: 'Fee Reminder - Email',
        messageType: MessageType.FEE_REMINDER,
        body:
          'Dear {{parentName}},\n\nThis is a reminder that the fee of ₹{{amount}} for {{studentName}} is due on {{dueDate}}.\n\nPlease make the payment at your earliest convenience.\n\nThank you,\nArnav Abacus Team',
        subject: 'Fee Payment Reminder - {{studentName}}',
        channel: MessageChannel.EMAIL,
        variables: ['parentName', 'studentName', 'amount', 'dueDate'],
      },
      {
        name: 'Absence Alert - SMS',
        messageType: MessageType.ABSENCE_ALERT,
        body:
          'Dear {{parentName}}, {{studentName}} was absent from class on {{date}}. Please inform if any concerns.',
        channel: MessageChannel.SMS,
        variables: ['parentName', 'studentName', 'date'],
      },
      {
        name: 'Test Result - SMS',
        messageType: MessageType.TEST_RESULT,
        body:
          '{{studentName}} scored {{percent}}% in {{testName}} on {{date}}. Total: {{obtained}}/{{total}}.',
        channel: MessageChannel.SMS,
        variables: [
          'studentName',
          'testName',
          'date',
          'percent',
          'obtained',
          'total',
        ],
      },
      {
        name: 'Birthday Wishes - WhatsApp',
        messageType: MessageType.BIRTHDAY,
        body:
          'Happy Birthday {{studentName}}! 🎉 Wishing you a wonderful day filled with joy and success! - Arnav Abacus Team',
        channel: MessageChannel.WHATSAPP,
        variables: ['studentName'],
      },
    ];

    for (const template of defaults) {
      const existing = await this.prisma.messageTemplate.findFirst({
        where: { name: template.name },
      });

      if (!existing) {
        await this.prisma.messageTemplate.create({
          data: { ...template, isActive: true },
        });
      }
    }

    return { message: 'Default templates seeded successfully' };
  }
}
