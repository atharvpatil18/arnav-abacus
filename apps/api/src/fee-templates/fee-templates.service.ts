import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFeeTemplateDto, UpdateFeeTemplateDto } from './fee-templates.dto';

@Injectable()
export class FeeTemplatesService {
  constructor(private prisma: PrismaService) {}

  async createTemplate(dto: CreateFeeTemplateDto) {
    // Check for duplicate name
    const existing = await this.prisma.feeTypeConfig.findFirst({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(`Fee template with name "${dto.name}" already exists`);
    }

    const template = await this.prisma.feeTypeConfig.create({
      data: {
        name: dto.name,
        description: dto.description,
        amount: dto.amount,
        applicableLevels: dto.applicableLevels,
        frequency: dto.frequency,
        category: dto.category || 'OTHER',
      },
    });

    return template;
  }

  async getAllTemplates() {
    const templates = await this.prisma.feeTypeConfig.findMany({
      orderBy: { name: 'asc' },
    });

    return templates;
  }

  async getTemplatesByLevel(level: number) {
    const templates = await this.prisma.feeTypeConfig.findMany({
      where: {
        applicableLevels: {
          has: level,
        },
      },
      orderBy: { name: 'asc' },
    });

    return templates;
  }

  async getTemplateById(id: number) {
    const template = await this.prisma.feeTypeConfig.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Fee template with ID ${id} not found`);
    }

    return template;
  }

  async updateTemplate(id: number, dto: UpdateFeeTemplateDto) {
    await this.getTemplateById(id); // Check exists

    // Check for duplicate name if updating name
    if (dto.name) {
      const existing = await this.prisma.feeTypeConfig.findFirst({
        where: {
          name: dto.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(`Fee template with name "${dto.name}" already exists`);
      }
    }

    const template = await this.prisma.feeTypeConfig.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.applicableLevels && { applicableLevels: dto.applicableLevels }),
        ...(dto.frequency && { frequency: dto.frequency }),
        ...(dto.category && { category: dto.category }),
      },
    });

    return template;
  }

  async deleteTemplate(id: number) {
    await this.getTemplateById(id); // Check exists

    // Check if template is in use
    const feesUsingTemplate = await this.prisma.fee.findMany({
      where: { feeTypeConfigId: id },
      take: 1,
    });

    if (feesUsingTemplate.length > 0) {
      throw new ConflictException('Cannot delete template that is currently in use by fees');
    }

    await this.prisma.feeTypeConfig.delete({
      where: { id },
    });

    return { message: 'Fee template deleted successfully', id };
  }

  async getTemplatesByCategory(category: string) {
    const templates = await this.prisma.feeTypeConfig.findMany({
      where: { category },
      orderBy: { name: 'asc' },
    });

    return templates;
  }

  async getTemplateUsageStats(id: number) {
    await this.getTemplateById(id); // Check exists

    const totalFees = await this.prisma.fee.count({
      where: { feeTypeConfigId: id },
    });

    const paidFees = await this.prisma.feePayment.count({
      where: {
        fee: {
          feeTypeConfigId: id,
        }
      },
    });

    const totalRevenue = await this.prisma.feePayment.aggregate({
      where: {
        fee: {
          feeTypeConfigId: id,
        }
      },
      _sum: {
        amount: true,
      },
    });

    return {
      templateId: id,
      totalFeesGenerated: totalFees,
      paidCount: paidFees,
      pendingCount: totalFees - paidFees,
      totalRevenue: totalRevenue._sum?.amount || 0,
    };
  }
}
