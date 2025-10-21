import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateStudentDto, UpdateStudentDto } from './students.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    return this.prisma.student.create({
      data: {
        ...dto,
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
      where: { id }
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return this.prisma.student.update({
      where: { id },
      data: dto,
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