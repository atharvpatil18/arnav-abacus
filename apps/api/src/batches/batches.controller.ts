import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  HttpException,
  HttpStatus,
  Query,
  ParseIntPipe,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { BatchesService } from './batches.service';
import { CreateBatchDto, UpdateBatchDto, AddStudentToBatchDto } from './batches.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('batches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createBatchDto: CreateBatchDto) {
    try {
      return await this.batchesService.create(createBatchDto);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new HttpException('Batch name must be unique', HttpStatus.CONFLICT);
      }
      throw new HttpException('Failed to create batch', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
  ) {
    try {
      const actualPage = page || 1;
      const actualLimit = limit || 10;
      
      if (actualPage < 1) {
        throw new BadRequestException('Page must be greater than 0');
      }

      return await this.batchesService.findAll({
        skip: (actualPage - 1) * actualLimit,
        take: actualLimit,
        search,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException('Failed to fetch batches', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const batch = await this.batchesService.findOne(id);
      if (!batch) {
        throw new NotFoundException(`Batch with ID ${id} not found`);
      }
      return batch;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Failed to fetch batch', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/capacity')
  @Roles(Role.ADMIN, Role.TEACHER)
  async checkCapacity(@Param('id', ParseIntPipe) id: number) {
    try {
      const capacity = await this.batchesService.checkCapacity(id);
      if (!capacity) {
        throw new NotFoundException(`Batch with ID ${id} not found`);
      }
      return capacity;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Failed to check batch capacity', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBatchDto: UpdateBatchDto,
  ) {
    try {
      return await this.batchesService.update(id, updateBatchDto);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new HttpException('Batch name must be unique', HttpStatus.CONFLICT);
      }
      throw new HttpException('Failed to update batch', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.batchesService.remove(id);
      return { message: 'Batch deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException('Failed to delete batch', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/add-student')
  @Roles(Role.ADMIN)
  async addStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() addStudentDto: AddStudentToBatchDto,
  ) {
    try {
      // Check capacity first
      const { hasCapacity, currentCount, maxCapacity } = await this.batchesService.checkCapacity(id);

      if (!hasCapacity) {
        throw new HttpException(
          `Batch is at full capacity (${currentCount}/${maxCapacity})`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Add student to batch
      return await this.batchesService.addStudent(id, addStudentDto.studentId);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Batch or student not found');
      }
      throw new HttpException('Failed to add student to batch', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id/remove-student/:studentId')
  @Roles(Role.ADMIN)
  async removeStudent(
    @Param('id', ParseIntPipe) batchId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    try {
      return await this.batchesService.removeStudent(batchId, studentId);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Batch or student not found');
      }
      throw new HttpException('Failed to remove student from batch', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/students')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getBatchStudents(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    try {
      const actualPage = page || 1;
      const actualLimit = limit || 10;

      if (actualPage < 1) {
        throw new BadRequestException('Page must be greater than 0');
      }

      return await this.batchesService.getBatchStudents(id, {
        skip: (actualPage - 1) * actualLimit,
        take: actualLimit,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Failed to fetch batch students', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
