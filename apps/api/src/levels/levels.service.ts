import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LevelsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.level.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.level.findUnique({
      where: { id },
      include: {
        batches: true,
      },
    });
  }

  async create(data: { name: string; passingPercent: number; description?: string }) {
    return this.prisma.level.create({
      data,
    });
  }

  async update(id: number, data: { name?: string; passingPercent?: number; description?: string }) {
    return this.prisma.level.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.level.delete({
      where: { id },
    });
  }
}
