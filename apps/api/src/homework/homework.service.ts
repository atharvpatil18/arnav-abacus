import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateHomeworkDto, UpdateHomeworkDto, SubmitHomeworkDto, GradeHomeworkDto } from './homework.dto';

@Injectable()
export class HomeworkService {
  constructor(private prisma: PrismaService) {}

  // Type-safe access to homework models
  private get homework() {
    return (this.prisma as any).homework;
  }

  private get homeworkSubmission() {
    return (this.prisma as any).homeworkSubmission;
  }

  async create(dto: CreateHomeworkDto) {
    return this.homework.create({
      data: dto,
      include: {
        batch: {
          include: {
            level: true,
            students: true
          }
        },
        teacher: {
          include: {
            user: true
          }
        }
      }
    });
  }

  async findAll() {
    return this.homework.findMany({
      include: {
        batch: {
          include: {
            level: true
          }
        },
        teacher: {
          include: {
            user: true
          }
        },
        submissions: true
      },
      orderBy: {
        dueDate: 'desc'
      }
    });
  }

  async findByBatch(batchId: number) {
    return this.homework.findMany({
      where: { batchId },
      include: {
        teacher: {
          include: {
            user: true
          }
        },
        submissions: {
          include: {
            student: true
          }
        }
      },
      orderBy: {
        dueDate: 'desc'
      }
    });
  }

  async findByTeacher(teacherId: number) {
    return this.homework.findMany({
      where: { teacherId },
      include: {
        batch: {
          include: {
            level: true,
            students: true
          }
        },
        submissions: {
          include: {
            student: true
          }
        }
      },
      orderBy: {
        dueDate: 'desc'
      }
    });
  }

  async findOne(id: number) {
    const homework = await this.homework.findUnique({
      where: { id },
      include: {
        batch: {
          include: {
            level: true,
            students: true
          }
        },
        teacher: {
          include: {
            user: true
          }
        },
        submissions: {
          include: {
            student: true
          }
        }
      }
    });

    if (!homework) {
      throw new NotFoundException(`Homework with ID ${id} not found`);
    }

    return homework;
  }

  async update(id: number, dto: UpdateHomeworkDto) {
    return this.homework.update({
      where: { id },
      data: dto
    });
  }

  async delete(id: number) {
    return this.homework.delete({
      where: { id }
    });
  }

  // Submission Management
  async submitHomework(dto: SubmitHomeworkDto) {
    return this.homeworkSubmission.create({
      data: {
        ...dto,
        submittedAt: new Date(),
        status: 'SUBMITTED'
      },
      include: {
        homework: true,
        student: true
      }
    });
  }

  async getSubmissionsByStudent(studentId: number) {
    return this.homeworkSubmission.findMany({
      where: { studentId },
      include: {
        homework: {
          include: {
            batch: true,
            teacher: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async gradeSubmission(dto: GradeHomeworkDto) {
    return this.homeworkSubmission.update({
      where: { id: dto.submissionId },
      data: {
        grade: dto.grade,
        feedback: dto.feedback,
        gradedBy: dto.gradedBy,
        gradedAt: new Date(),
        status: 'GRADED'
      },
      include: {
        student: true,
        homework: true
      }
    });
  }

  async getPendingSubmissions(teacherId: number) {
    const homeworks = await this.homework.findMany({
      where: { teacherId },
      include: {
        submissions: {
          where: {
            status: { in: ['SUBMITTED', 'LATE'] }
          },
          include: {
            student: true
          }
        }
      }
    });

    return homeworks.filter((hw: any) => hw.submissions.length > 0);
  }

  // ============= PHASE 6 ENHANCEMENTS =============

  // File Attachments Management
  async addAttachment(submissionId: number, fileUrl: string) {
    const submission = await this.homeworkSubmission.findUnique({
      where: { id: submissionId }
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const attachments = submission.attachments ? JSON.parse(submission.attachments) : [];
    attachments.push({ url: fileUrl, uploadedAt: new Date() });

    return this.homeworkSubmission.update({
      where: { id: submissionId },
      data: { attachments: JSON.stringify(attachments) }
    });
  }

  async removeAttachment(submissionId: number, fileUrl: string) {
    const submission = await this.homeworkSubmission.findUnique({
      where: { id: submissionId }
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const attachments = submission.attachments ? JSON.parse(submission.attachments) : [];
    const filtered = attachments.filter((a: any) => a.url !== fileUrl);

    return this.homeworkSubmission.update({
      where: { id: submissionId },
      data: { attachments: JSON.stringify(filtered) }
    });
  }

  // Enhanced Status Tracking
  async getByStatus(status: string, batchId?: number, teacherId?: number) {
    // Cast status to proper enum type
    const submissionStatus = status as any;
    
    return this.homework.findMany({
      where: {
        ...(batchId && { batchId }),
        ...(teacherId && { teacherId }),
        submissions: {
          some: { status: submissionStatus }
        }
      },
      include: {
        batch: true,
        teacher: { include: { user: true } },
        submissions: {
          where: { status: submissionStatus },
          include: { student: true }
        }
      }
    });
  }

  async updateHomeworkStatus(id: number, priority: string) {
    return this.homework.update({
      where: { id },
      data: { priority }
    });
  }

  // Automatic Reminders
  async sendReminder(homeworkId: number) {
    const homework = await this.homework.findUnique({
      where: { id: homeworkId },
      include: {
        batch: { include: { students: true } },
        submissions: true
      }
    });

    if (!homework) {
      throw new NotFoundException('Homework not found');
    }

    const studentsWithoutSubmission = homework.batch.students.filter(
      (student: any) => !homework.submissions.some((s: any) => s.studentId === student.id)
    );

    await this.homework.update({
      where: { id: homeworkId },
      data: {
        reminderSent: true,
        reminderDate: new Date()
      }
    });

    return {
      message: 'Reminder sent',
      recipients: studentsWithoutSubmission.map((s: any) => s.id),
      count: studentsWithoutSubmission.length
    };
  }

  async getRemindersDue() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.homework.findMany({
      where: {
        dueDate: {
          lte: tomorrow,
          gte: new Date()
        },
        reminderSent: false
      },
      include: {
        batch: { include: { students: true } },
        teacher: { include: { user: true } }
      }
    });
  }

  // Calendar Integration
  async getCalendarFeed(studentId?: number, batchId?: number) {
    const where: any = {};
    if (batchId) where.batchId = batchId;

    const homeworks = await this.homework.findMany({
      where,
      include: {
        batch: true,
        teacher: { include: { user: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    return homeworks.map((hw: any) => ({
      summary: hw.title,
      description: hw.description,
      dtstart: hw.dueDate.toISOString(),
      dtend: hw.dueDate.toISOString(),
      location: hw.batch.name,
      categories: ['HOMEWORK', hw.priority]
    }));
  }

  async exportCalendar(batchId: number) {
    const feed = await this.getCalendarFeed(undefined, batchId);
    return { format: 'ical', events: feed };
  }

  // Statistics Dashboard
  async getStatistics(batchId?: number, teacherId?: number) {
    const where: any = {};
    if (batchId) where.batchId = batchId;
    if (teacherId) where.teacherId = teacherId;

    const homeworks = await this.homework.findMany({
      where,
      include: {
        submissions: true
      }
    });

    const totalHomework = homeworks.length;
    const totalSubmissions = homeworks.reduce((sum: number, hw: any) => sum + hw.submissions.length, 0);
    const gradedSubmissions = homeworks.reduce(
      (sum: number, hw: any) => sum + hw.submissions.filter((s: any) => s.status === 'GRADED').length,
      0
    );
    const lateSubmissions = homeworks.reduce(
      (sum: number, hw: any) => sum + hw.submissions.filter((s: any) => s.lateSubmission).length,
      0
    );

    const avgGrade = homeworks.reduce((sum: number, hw: any) => sum + (hw.averageGrade || 0), 0) / totalHomework || 0;
    const completionRate = totalSubmissions / (totalHomework * 30); // Assuming ~30 students

    return {
      totalHomework,
      totalSubmissions,
      gradedSubmissions,
      lateSubmissions,
      avgGrade: avgGrade.toFixed(2),
      completionRate: (completionRate * 100).toFixed(2) + '%',
      priorityBreakdown: {
        HIGH: homeworks.filter((hw: any) => hw.priority === 'HIGH').length,
        MEDIUM: homeworks.filter((hw: any) => hw.priority === 'MEDIUM').length,
        LOW: homeworks.filter((hw: any) => hw.priority === 'LOW').length
      }
    };
  }

  async getBatchStatistics(batchId: number) {
    return this.getStatistics(batchId);
  }

  // Gamification
  async getLeaderboard(batchId?: number, limit: number = 10) {
    const where: any = {};
    if (batchId) {
      where.homework = { batchId };
    }

    const submissions = await this.homeworkSubmission.findMany({
      where,
      include: {
        student: true,
        homework: true
      }
    });

    const studentPoints = submissions.reduce((acc: any, sub: any) => {
      if (!acc[sub.studentId]) {
        acc[sub.studentId] = {
          student: sub.student,
          totalPoints: 0,
          submissions: 0,
          avgGrade: 0,
          badges: []
        };
      }

      acc[sub.studentId].totalPoints += sub.pointsEarned || 0;
      acc[sub.studentId].submissions += 1;
      acc[sub.studentId].avgGrade += sub.grade || 0;

      if (sub.badgesEarned) {
        const badges = JSON.parse(sub.badgesEarned);
        acc[sub.studentId].badges.push(...badges);
      }

      return acc;
    }, {});

    const leaderboard = Object.values(studentPoints).map((sp: any) => ({
      ...sp,
      avgGrade: (sp.avgGrade / sp.submissions).toFixed(2),
      badges: [...new Set(sp.badges)]
    }));

    return leaderboard
      .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
      .slice(0, limit);
  }

  async getStudentBadges(studentId: number) {
    const submissions = await this.homeworkSubmission.findMany({
      where: { studentId },
      include: { homework: true }
    });

    const allBadges: string[] = [];
    submissions.forEach((sub: any) => {
      if (sub.badgesEarned) {
        allBadges.push(...JSON.parse(sub.badgesEarned));
      }
    });

    const badgeCounts = allBadges.reduce((acc: any, badge: string) => {
      acc[badge] = (acc[badge] || 0) + 1;
      return acc;
    }, {});

    const totalPoints = submissions.reduce((sum: number, sub: any) => sum + (sub.pointsEarned || 0), 0);

    return {
      studentId,
      totalPoints,
      badges: badgeCounts,
      totalBadges: allBadges.length,
      uniqueBadges: Object.keys(badgeCounts).length
    };
  }
}
