import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTestDto, UpdateTestDto } from './tests.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  private calculateTestSummary(subjects: any[]) {
    let totalObtained = 0;
    let totalPossible = 0;

    subjects.forEach(subject => {
      totalObtained += subject.obtained;
      totalPossible += subject.total;
    });

    const percent = (totalObtained / totalPossible) * 100;

    return {
      totalObtained,
      totalPossible,
      percent,
    };
  }

  async create(dto: CreateTestDto) {
    const { totalObtained, totalPossible, percent } = this.calculateTestSummary(dto.subjects);

    const jsonData = {
      ...dto,
      subjects: JSON.parse(JSON.stringify(dto.subjects)) as Prisma.JsonObject,
      totalObtained,
      totalPossible,
      percent,
    };
    return this.prisma.test.create({
      data: jsonData,
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        batch: {
          include: {
            level: true,
          }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.test.findMany({
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        batch: {
          include: {
            level: true,
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
  }

  async findOne(id: number) {
    const test = await this.prisma.test.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        batch: {
          include: {
            level: true,
          }
        }
      }
    });

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    return test;
  }

  async update(id: number, dto: UpdateTestDto) {
    const test = await this.prisma.test.findUnique({
      where: { id }
    });

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    const { totalObtained, totalPossible, percent } = this.calculateTestSummary(dto.subjects);

    const jsonData = {
      ...dto,
      subjects: JSON.parse(JSON.stringify(dto.subjects)) as Prisma.JsonObject,
      totalObtained,
      totalPossible,
      percent,
    };
    return this.prisma.test.update({
      where: { id },
      data: jsonData,
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        batch: {
          include: {
            level: true,
          }
        }
      }
    });
  }

  async remove(id: number) {
    const test = await this.prisma.test.findUnique({
      where: { id }
    });

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    await this.prisma.test.delete({
      where: { id }
    });
  }

  async getStudentAllLevelsSummary(studentId: number) {
    // Get student's current level
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { currentLevel: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const summaries = [];
    for (let level = 1; level <= student.currentLevel; level++) {
      const summary = await this.getStudentLevelSummary(studentId, level);
      summaries.push(summary);
    }

    return summaries;
  }

  async findByStudent(studentId: number) {
    return this.prisma.test.findMany({
      where: { studentId },
      include: {
        batch: {
          include: {
            level: true,
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
  }

  async findByBatchAndDate(batchId: number, date: Date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.prisma.test.findMany({
      where: {
        batchId,
        date: {
          gte: startDate,
          lte: endDate,
        }
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        student: {
          firstName: 'asc'
        }
      }
    });
  }

  async getStudentLevelSummary(studentId: number, level: number) {
    const tests = await this.prisma.test.findMany({
      where: {
        studentId,
        level,
      },
      orderBy: {
        date: 'desc'
      }
    });

    if (tests.length === 0) {
      return {
        level,
        totalTests: 0,
        averagePercent: 0,
        passingTests: 0,
      };
    }

    const totalPercent = tests.reduce((sum, test) => sum + test.percent, 0);
    const averagePercent = totalPercent / tests.length;

    // Get passing percent for this level
    const level_ = await this.prisma.level.findFirst({
      where: { id: level }
    });

    const passingPercent = level_?.passingPercent || 50;
    const passingTests = tests.filter(test => test.percent >= passingPercent).length;

    return {
      level,
      totalTests: tests.length,
      averagePercent,
      passingTests,
      passingPercent,
    };
  }
}