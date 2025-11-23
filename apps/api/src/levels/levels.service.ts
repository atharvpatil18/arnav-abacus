import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LevelsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.level.findMany({
      include: {
        _count: {
          select: {
            batches: true
          }
        }
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.level.findUnique({
      where: { id },
      include: {
        batches: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  }
                }
              }
            },
            _count: {
              select: { students: true }
            }
          }
        },
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

  async getLevelStatistics(id: number) {
    const level = await this.prisma.level.findUnique({
      where: { id },
      include: {
        batches: {
          include: {
            students: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                currentLevel: true,
              }
            },
            _count: {
              select: { students: true }
            }
          }
        }
      }
    });

    if (!level) {
      throw new NotFoundException('Level not found');
    }

    // Get all students currently at this level
    const allStudents = level.batches.flatMap(batch => batch.students);
    const studentsAtThisLevel = allStudents.filter(s => s.currentLevel === id);

    return {
      levelId: id,
      levelName: level.name,
      passingPercent: level.passingPercent,
      totalBatches: level.batches.length,
      totalStudentsInBatches: allStudents.length,
      studentsAtThisLevel: studentsAtThisLevel.length,
      batches: level.batches.map(batch => ({
        id: batch.id,
        name: batch.name,
        studentCount: batch._count.students,
      }))
    };
  }

  async getStudentsByLevel(levelId: number) {
    return this.prisma.student.findMany({
      where: { currentLevel: levelId },
      include: {
        batch: {
          include: {
            level: true,
            teacher: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { batch: { name: 'asc' } },
        { firstName: 'asc' }
      ]
    });
  }
}
