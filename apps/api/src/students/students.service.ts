import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateStudentDto, UpdateStudentDto } from './students.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    // If batchId is provided, validate that the batch's level matches student's current level
    if (dto.batchId) {
      const batch = await this.prisma.batch.findUnique({
        where: { id: dto.batchId },
        include: { level: true }
      });

      if (!batch) {
        throw new NotFoundException(`Batch with ID ${dto.batchId} not found`);
      }

      // Warn if level mismatch (but don't block - allow admin override)
      if (batch.levelId !== dto.currentLevel) {
        console.warn(`Student's current level (${dto.currentLevel}) doesn't match batch level (${batch.levelId}). Proceeding with admin override.`);
      }
    }

    // Calculate age if dob is provided
    let age = dto.age;
    if (dto.dob && !age) {
      const today = new Date();
      const birthDate = new Date(dto.dob);
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    return this.prisma.student.create({
      data: {
        ...dto,
        age,
        joiningDate: new Date(),
      },
      include: {
        batch: {
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
        }
      }
    });
  }

  async findAll() {
    return this.prisma.student.findMany({
      include: {
        batch: {
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
        }
      }
    });
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        batch: {
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
        },
        tests: {
          orderBy: {
            date: 'desc'
          },
          take: 5
        },
        attendances: {
          orderBy: {
            date: 'desc'
          },
          take: 10
        },
        fees: {
          orderBy: {
            dueDate: 'desc'
          },
          take: 5
        }
      }
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  async update(id: number, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        batch: {
          include: { level: true }
        }
      }
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // If updating batchId, validate level consistency
    if (dto.batchId !== undefined && dto.batchId !== student.batchId) {
      const batch = await this.prisma.batch.findUnique({
        where: { id: dto.batchId },
        include: { level: true }
      });

      if (!batch) {
        throw new NotFoundException(`Batch with ID ${dto.batchId} not found`);
      }

      const targetLevel = dto.currentLevel ?? student.currentLevel;
      if (batch.levelId !== targetLevel) {
        console.warn(`Student's current level (${targetLevel}) doesn't match batch level (${batch.levelId}). Proceeding with admin override.`);
      }
    }

    // Calculate age if dob is updated
    let age = dto.age;
    if (dto.dob && !age) {
      const today = new Date();
      const birthDate = new Date(dto.dob);
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    const updateData = { ...dto };
    if (age !== undefined) {
      updateData.age = age;
    }

    return this.prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        batch: {
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
        }
      }
    });
  }

  async remove(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id }
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    await this.prisma.student.delete({
      where: { id }
    });
  }

  async findByBatch(batchId: number) {
    return this.prisma.student.findMany({
      where: { batchId },
      include: {
        batch: {
          include: {
            level: true
          }
        }
      }
    });
  }
}