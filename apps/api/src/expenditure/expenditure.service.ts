import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateExpenditureDto, UpdateExpenditureDto } from './expenditure.dto';

@Injectable()
export class ExpenditureService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateExpenditureDto, recordedBy: number) {
    return this.prisma.expenditure.create({
      data: {
        ...dto,
        date: new Date(dto.date),
        recordedBy,
      },
    });
  }

  async findAll(startDate?: string, endDate?: string, category?: string) {
    const where: any = {};
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    
    if (category) {
      where.category = category;
    }

    return this.prisma.expenditure.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.expenditure.findUnique({
      where: { id },
    });
  }

  async update(id: number, dto: UpdateExpenditureDto) {
    const data: any = { ...dto };
    if (dto.date) {
      data.date = new Date(dto.date);
    }
    
    return this.prisma.expenditure.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.expenditure.delete({
      where: { id },
    });
  }

  async getTotalExpenditure(startDate?: string, endDate?: string) {
    const where: any = {};
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const result = await this.prisma.expenditure.aggregate({
      where,
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  }

  async getCategoryWiseExpenditure(startDate?: string, endDate?: string) {
    const where: any = {};
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const expenditures = await this.prisma.expenditure.findMany({
      where,
      select: {
        category: true,
        amount: true,
      },
    });

    const categoryMap = new Map<string, number>();
    
    expenditures.forEach(exp => {
      const current = categoryMap.get(exp.category) || 0;
      categoryMap.set(exp.category, current + exp.amount);
    });

    return Array.from(categoryMap.entries()).map(([category, total]) => ({
      category,
      total,
    }));
  }
}
