import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class HolidaysService {
  constructor(private prisma: PrismaService) {}

  // Create Holiday
  async create(data: any) {
    return this.prisma.holiday.create({ data });
  }

  // Get All Holidays
  async getAll(year?: number) {
    const where: any = {};
    
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      where.date = { gte: startDate, lte: endDate };
    }

    return this.prisma.holiday.findMany({
      where,
      orderBy: { date: 'asc' }
    });
  }

  // Get Upcoming Holidays
  async getUpcoming(limit: number = 10) {
    return this.prisma.holiday.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      take: limit
    });
  }

  // Update Holiday
  async update(id: number, data: any) {
    return this.prisma.holiday.update({ where: { id }, data });
  }

  // Delete Holiday
  async delete(id: number) {
    return this.prisma.holiday.delete({ where: { id } });
  }

  // Makeup Class Scheduling
  async scheduleMakeupClass(data: any) {
    return this.prisma.makeupClass.create({
      data,
      include: { batch: true }
    });
  }

  // Get Makeup Classes
  async getMakeupClasses(batchId?: number) {
    return this.prisma.makeupClass.findMany({
      where: batchId ? { batchId } : undefined,
      include: { batch: true },
      orderBy: { newDate: 'asc' }
    });
  }

  // Update Makeup Class Status
  async updateMakeupStatus(id: number, notified: boolean) {
    return this.prisma.makeupClass.update({
      where: { id },
      data: { notified }
    });
  }
}
