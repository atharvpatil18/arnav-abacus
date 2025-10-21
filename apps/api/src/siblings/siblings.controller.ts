import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SiblingsService } from './siblings.service';
import { CreateSiblingDto } from './siblings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('siblings')
@UseGuards(JwtAuthGuard)
export class SiblingsController {
  constructor(private readonly siblingsService: SiblingsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  create(@Body() createSiblingDto: CreateSiblingDto) {
    return this.siblingsService.create(createSiblingDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  findAll() {
    return this.siblingsService.findAll();
  }

  @Get('student/:studentId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.siblingsService.findByStudent(studentId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.siblingsService.remove(id);
  }
}
