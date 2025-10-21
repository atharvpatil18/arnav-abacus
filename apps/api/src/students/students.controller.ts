import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Put, 
  Param, 
  Delete, 
  UseGuards, 
  Query, 
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto } from './students.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, StudentStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  findAll(
    @Query('batchId') batchId?: string,
    @Query('level') level?: string,
    @Query('search') search?: string
  ) {
    const query: any = {};

    if (batchId) {
      query.batchId = parseInt(batchId, 10);
    }

    if (level) {
      query.currentLevel = parseInt(level, 10);
    }

    if (search) {
      query.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.student.findMany({
      where: query,
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

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(+id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(+id, updateStudentDto);
  }

  @Post(':id/assign-batch')
  @Roles(Role.ADMIN)
  async assignBatch(@Param('id') id: string, @Body('batchId') batchId: number) {
    // Check batch capacity
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        _count: {
          select: { students: true }
        }
      }
    });

    if (!batch) {
      throw new ForbiddenException('Batch not found');
    }

    if (batch.capacity && batch._count.students >= batch.capacity) {
      throw new ForbiddenException('Batch is at full capacity');
    }

    return this.studentsService.update(+id, { batchId });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async softDelete(@Param('id') id: string) {
    await this.studentsService.update(+id, { status: StudentStatus.INACTIVE });
  }

  @Post(':id/toggle-status')
  @Roles(Role.ADMIN)
  async toggleStatus(@Param('id') id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: +id },
      select: { status: true }
    });

    if (!student) {
      throw new ForbiddenException('Student not found');
    }

    const newStatus = student.status === StudentStatus.ACTIVE 
      ? StudentStatus.INACTIVE 
      : StudentStatus.ACTIVE;

    return this.studentsService.update(+id, { status: newStatus });
  }

  @Get(':id/level-summary')
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
  async getLevelSummary(@Param('id') id: string) {
    const tests = await this.prisma.test.findMany({
      where: { studentId: +id },
      orderBy: { level: 'asc' },
    });

    const summary = tests.reduce<Record<number, { count: number; totalPercent: number }>>((acc, test) => {
      if (!acc[test.level]) {
        acc[test.level] = { count: 0, totalPercent: 0 };
      }
      acc[test.level].count++;
      acc[test.level].totalPercent += test.percent;
      return acc;
    }, {});

    return Object.entries(summary).map(([level, data]) => ({
      level: parseInt(level, 10),
      averagePercent: data.totalPercent / data.count,
      testCount: data.count,
    }));
  }

  @Post(':id/photo')
  @Roles(Role.ADMIN, Role.TEACHER)
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads/students',
      filename: (req, file, cb) => {
        const studentId = req.params.id;
        const fileExtension = extname(file.originalname);
        const fileName = `student-${studentId}-${Date.now()}${fileExtension}`;
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const photoUrl = `/uploads/students/${file.filename}`;
    
    return this.studentsService.update(+id, { photoUrl });
  }

  @Delete(':id/photo')
  @Roles(Role.ADMIN)
  async deletePhoto(@Param('id') id: string) {
    return this.studentsService.update(+id, { photoUrl: undefined });
  }
}
