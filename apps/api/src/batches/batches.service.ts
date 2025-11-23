import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBatchDto, UpdateBatchDto, FindAllBatchesParams, GetBatchStudentsParams } from './batches.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BatchesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBatchDto) {
    return this.prisma.batch.create({
      data: dto,
      include: {
        level: true,
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    });
  }

  async findAll(params: FindAllBatchesParams) {
    const { skip, take, search, levelId } = params;
    
    const whereClause: Prisma.BatchWhereInput = {};
    
    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive' as Prisma.QueryMode,
      };
    }
    
    if (levelId) {
      whereClause.levelId = levelId;
    }

    const [total, items] = await Promise.all([
      this.prisma.batch.count({ where: whereClause }),
      this.prisma.batch.findMany({
        where: whereClause,
        skip,
        take,
        include: {
          level: true,
          teacher: {
            include: {
              user: {
                select: {
                  name: true,
                }
              }
            }
          },
          _count: {
            select: { students: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      items,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take)
    };
  }

  async findOne(id: number) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: {
        level: true,
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              }
            }
          }
        },
        students: {
          include: {
            tests: {
              orderBy: {
                date: 'desc'
              },
              take: 1
            }
          }
        }
      }
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    return batch;
  }

  async update(id: number, dto: UpdateBatchDto) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: {
        students: true
      }
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    // If reducing capacity, check if it's valid
    if (dto.capacity && batch.students.length > dto.capacity) {
      throw new BadRequestException(
        `Cannot reduce capacity below current student count (${batch.students.length})`
      );
    }

    return this.prisma.batch.update({
      where: { id },
      data: dto,
      include: {
        level: true,
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    });
  }

  async remove(id: number) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: {
        students: true
      }
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    if (batch.students.length > 0) {
      throw new BadRequestException('Cannot delete batch with enrolled students');
    }

    await this.prisma.batch.delete({
      where: { id }
    });
  }

  async checkCapacity(id: number) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true }
        }
      }
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    if (!batch.capacity) {
      return { hasCapacity: true };
    }

    return {
      hasCapacity: batch._count.students < batch.capacity,
      currentCount: batch._count.students,
      maxCapacity: batch.capacity,
    };
  }

  async addStudent(batchId: number, studentId: number) {
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        level: true,
        _count: {
          select: { students: true }
        }
      }
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batchId} not found`);
    }

    // Check if student is already in a batch
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { batch: true }
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    if (student.batchId) {
      throw new BadRequestException(
        `Student is already enrolled in batch ${student.batch?.name}`
      );
    }

    // Check capacity
    if (batch.capacity && batch._count.students >= batch.capacity) {
      throw new BadRequestException(
        `Batch is at full capacity (${batch._count.students}/${batch.capacity})`
      );
    }

    // Warn if student level doesn't match batch level
    if (student.currentLevel !== batch.levelId) {
      console.warn(
        `Student ${student.firstName} ${student.lastName} (Level ${student.currentLevel}) ` +
        `is being added to batch "${batch.name}" (Level ${batch.levelId}). ` +
        `Consider updating student's current level.`
      );
    }

    return this.prisma.student.update({
      where: { id: studentId },
      data: {
        batch: { connect: { id: batchId } }
      },
      include: {
        batch: {
          include: {
            level: true
          }
        }
      }
    });
  }

  async removeStudent(batchId: number, studentId: number) {
    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        batchId: batchId
      }
    });

    if (!student) {
      throw new NotFoundException(
        `Student with ID ${studentId} not found in batch ${batchId}`
      );
    }

    return this.prisma.student.update({
      where: { id: studentId },
      data: {
        batch: { disconnect: true }
      }
    });
  }

  async getBatchStudents(batchId: number, params: GetBatchStudentsParams) {
    const { skip, take } = params;

    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId }
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batchId} not found`);
    }

    const [total, items] = await Promise.all([
      this.prisma.student.count({
        where: { batchId }
      }),
      this.prisma.student.findMany({
        where: { batchId },
        skip,
        take,
        include: {
          tests: {
            orderBy: {
              date: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          firstName: 'asc'
        }
      })
    ]);

    return {
      items,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take)
    };
  }
}